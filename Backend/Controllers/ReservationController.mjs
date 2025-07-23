import Reservation from '../Modals/ReservationModal.mjs';
import Rooms from '../Modals/RoomsModal.mjs';
import EmailController from './EmailController.mjs';

// Create a reservation
export const createReservation = async (req, res) => {
  try {
    const { room, guestName, guestEmail, guestPhone, guestId, checkin, checkout, guests, additionalServices, price, role } = req.body;
    // Generate a unique reservationId
    const generateReservationId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const unique = Math.random().toString(36).substr(2, 6).toUpperCase();
      return `RSV-${year}${month}-${unique}`;
    };
    let reservationId;
    let isUnique = false;
    // Ensure uniqueness in DB
    while (!isUnique) {
      reservationId = generateReservationId();
      const exists = await Reservation.findOne({ reservationId });
      if (!exists) isUnique = true;
    }
    // console.log('Reservation request body:', req.body);
    // Check if room is available for the given dates
    const overlapping = await Reservation.findOne({
      room,
      status: { $ne: "Cancelled" }, // Only consider non-cancelled reservations
      $or: [
        { checkin: { $lt: new Date(checkout) }, checkout: { $gt: new Date(checkin) } },
      ],
    });
    if (overlapping) {
      return res.status(409).json({ message: 'Room is not available for the selected dates.' });
    }
    // Validate guestPhone
    if (!guestPhone) {
      return res.status(400).json({ message: 'Guest phone number is required.' });
    }
    // console.log('Saving reservation:', { room, guestName, guestEmail, guestId, checkin, checkout, guests, additionalServices });
    const status = role === 'receptionist' ? 'Confirmed' : undefined;
    const reservation = new Reservation({ room, guestName, guestEmail, guestPhone, guestId, checkin, checkout, guests, additionalServices, reservationId, price, status });
    await reservation.save();
    // Populate room details for email
    const populatedReservation = await Reservation.findById(reservation._id).populate('room');
    // Compose HTML email
    const html = `
      <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
        <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Reservation Confirmed!</h2>
        <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${guestName}</b>,<br>Your reservation has been successfully completed. Here are your reservation details:</p>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Room Details</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Room Name:</b> ${populatedReservation.room.name}</li>
            <li><b>Type:</b> ${populatedReservation.room.roomType}</li>
            <li><b>Beds:</b> ${populatedReservation.room.beds}</li>
            <li><b>Baths:</b> ${populatedReservation.room.baths}</li>
            <li><b>Area:</b> ${populatedReservation.room.area} m²</li>
            <li><b>Rate:</b> $${populatedReservation.room.rate} / night</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Reservation Details</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Check-in:</b> ${new Date(populatedReservation.checkin).toLocaleDateString()}</li>
            <li><b>Check-out:</b> ${new Date(populatedReservation.checkout).toLocaleDateString()}</li>
            <li><b>Guests:</b> ${populatedReservation.guests}</li>
            <li><b>Phone:</b> ${populatedReservation.guestPhone}</li>
            <li><b>Email:</b> ${populatedReservation.guestEmail}</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Additional Services</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Spa:</b> ${populatedReservation.additionalServices.spa ? 'Yes' : 'No'}</li>
            <li><b>Wake-up Call:</b> ${populatedReservation.additionalServices.wakeup ? 'Yes, at ' + (populatedReservation.additionalServices.wakeupTime || '-') : 'No'}</li>
            <li><b>Airport Pickup:</b> ${populatedReservation.additionalServices.airport ? 'Yes, at ' + (populatedReservation.additionalServices.airportTime || '-') : 'No'}</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">Thank you for choosing us!<br>We look forward to your stay.</p>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Reservation System</p>
      </div>
    `;
    // Send confirmation email
    try {
      await EmailController.sendMail(
        guestEmail,
        'Your Reservation is Confirmed! - Hotel',
        html
      );
    } catch (e) {
      console.error('Reservation confirmation email error:', e);
    }
    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// Get available rooms for a date range
export const getAvailableRooms = async (req, res) => {
  try {
    const { checkin, checkout } = req.query;
    if (!checkin || !checkout) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
    }
    // Find rooms that are NOT reserved for the given date range
    const reservedRooms = await Reservation.find({
      status: { $ne: "Cancelled" }, // Only consider non-cancelled reservations
      $or: [
        { checkin: { $lt: new Date(checkout) }, checkout: { $gt: new Date(checkin) } },
      ],
    }).distinct('room');
    const availableRooms = await Rooms.find({ _id: { $nin: reservedRooms } });
    res.status(200).json({ availableRooms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rooms', error: error.message });
  }
};

// Get reservations by guestId
export const getReservationsByGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { email } = req.query;
    if (!guestId && !email) {
      return res.status(400).json({ message: 'guestId or email is required' });
    }
    const query = [];
    if (guestId) query.push({ guestId });
    if (email) query.push({ guestEmail: email });
    const reservations = await Reservation.find({ $or: query }).populate('room');
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('room');
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

// Check-in a reservation
export const checkInReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(id, { status: 'Checked In' }, { new: true });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    // Update room status
    await Rooms.findByIdAndUpdate(reservation.room, { status: 'Occupied' });
    res.status(200).json({ message: 'Checked in successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error during check-in', error: error.message });
  }
};

// Check-out a reservation
export const checkOutReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(id, { status: 'Checked Out' }, { new: true });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    // Update room status
    await Rooms.findByIdAndUpdate(reservation.room, { status: 'Vacant' });
    res.status(200).json({ message: 'Checked out successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error during check-out', error: error.message });
  }
};

// Cancel a reservation
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, role } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: 'Cancelled', cancelledBy: { userId, name, role } },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.status(200).json({ message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
};

// Get reservation by reservationId
export const getReservationByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findOne({ reservationId }).populate('room');
    res.status(200).json({ reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservation', error: error.message });
  }
};