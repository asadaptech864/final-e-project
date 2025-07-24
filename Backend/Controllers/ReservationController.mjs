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
    // Check if room is available for the given dates
    const overlapping = await Reservation.findOne({
      room,
      status: { $ne: "Cancelled", $ne: "Checked Out" }, // Only consider non-cancelled reservations
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
    const status = role === 'receptionist' ? 'Confirmed' : undefined;
    const reservation = new Reservation({ room, guestName, guestEmail, guestPhone, guestId, checkin, checkout, guests, additionalServices, reservationId, price, status });
    await reservation.save();
    // Populate room details for email
    const populatedReservation = await Reservation.findById(reservation._id).populate('room');
    // Compose HTML email (reuse logic below)
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
    // Send confirmation email only for receptionist
    if (role === 'receptionist') {
      try {
        await EmailController.sendMail(
          guestEmail,
          'Your Reservation is Confirmed! - Hotel',
          html
        );
      } catch (e) {
        console.error('Reservation confirmation email error:', e);
      }
    }
    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// New: Send reservation confirmation email after payment (for guests)
export const sendReservationConfirmationEmail = async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ message: 'Reservation ID is required.' });
    }
    const reservation = await Reservation.findOne({ reservationId }).populate('room');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }
    // Compose HTML email (reuse logic)
    const html = `
      <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
        <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Reservation Confirmed!</h2>
        <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${reservation.guestName}</b>,<br>Your reservation has been successfully completed. Here are your reservation details:</p>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Room Details</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Room Name:</b> ${reservation.room.name}</li>
            <li><b>Type:</b> ${reservation.room.roomType}</li>
            <li><b>Beds:</b> ${reservation.room.beds}</li>
            <li><b>Baths:</b> ${reservation.room.baths}</li>
            <li><b>Area:</b> ${reservation.room.area} m²</li>
            <li><b>Rate:</b> $${reservation.room.rate} / night</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Reservation Details</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Check-in:</b> ${new Date(reservation.checkin).toLocaleDateString()}</li>
            <li><b>Check-out:</b> ${new Date(reservation.checkout).toLocaleDateString()}</li>
            <li><b>Guests:</b> ${reservation.guests}</li>
            <li><b>Phone:</b> ${reservation.guestPhone}</li>
            <li><b>Email:</b> ${reservation.guestEmail}</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Additional Services</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Spa:</b> ${reservation.additionalServices.spa ? 'Yes' : 'No'}</li>
            <li><b>Wake-up Call:</b> ${reservation.additionalServices.wakeup ? 'Yes, at ' + (reservation.additionalServices.wakeupTime || '-') : 'No'}</li>
            <li><b>Airport Pickup:</b> ${reservation.additionalServices.airport ? 'Yes, at ' + (reservation.additionalServices.airportTime || '-') : 'No'}</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">Thank you for choosing us!<br>We look forward to your stay.</p>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Reservation System</p>
      </div>
    `;
    try {
      await EmailController.sendMail(
        reservation.guestEmail,
        'Your Reservation is Confirmed! - Hotel',
        html
      );
    } catch (e) {
      console.error('Reservation confirmation email error:', e);
      return res.status(500).json({ message: 'Failed to send confirmation email.' });
    }
    res.status(200).json({ message: 'Confirmation email sent.' });
  } catch (error) {
    console.error('Send confirmation email error:', error);
    res.status(500).json({ message: 'Error sending confirmation email', error: error.message });
  }
};

// Get available rooms for a date range
export const getAvailableRooms = async (req, res) => {
  try {
    const { checkin, checkout } = req.query;
    if (!checkin || !checkout) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
    }
    // Only reservations that are not Cancelled or Checked Out should block availability.
    // This means if a reservation is Checked Out (even if its date range overlaps), it will not block new bookings.
    // Same for Cancelled reservations.
    const reservedRooms = await Reservation.find({
      status: { $nin: ["Cancelled", "Checked Out"] }, // Ignore Cancelled and Checked Out
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
    let reservation = await Reservation.findById(id).populate('room');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Calculate actual stay duration
    const checkinDate = new Date(reservation.checkin);
    const now = new Date();
    now.setHours(0,0,0,0);
    checkinDate.setHours(0,0,0,0);
    let nights = Math.ceil((now - checkinDate) / (1000 * 60 * 60 * 24));
    if (nights < 1) nights = 1;

    // Room rate (ensure number)
    const roomRate = Number(reservation.room.rate);
    const roomCharge = nights * roomRate;

    // Extra services (example: spa $50, wakeup $10, airport $30)
    let extra = 0;
    let extraDetails = [];
    if (reservation.additionalServices?.spa) { extra += 50; extraDetails.push({ name: 'Spa', price: 50 }); }
    if (reservation.additionalServices?.wakeup) { extra += 10; extraDetails.push({ name: 'Wake-up Call', price: 10 }); }
    if (reservation.additionalServices?.airport) { extra += 30; extraDetails.push({ name: 'Airport Pickup', price: 30 }); }

    // Total
    const total = roomCharge + extra;

    // Bill breakdown
    const bill = {
      nights,
      roomRate,
      roomCharge,
      extraServices: extraDetails,
      extraTotal: extra,
      total
    };

    // Generate invoice HTML
    const invoiceHtml = `
      <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
        <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Hotel Invoice</h2>
        <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${reservation.guestName}</b>,<br>Thank you for staying with us. Here is your invoice:</p>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Room Details</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Room Name:</b> ${reservation.room.name}</li>
            <li><b>Type:</b> ${reservation.room.roomType}</li>
            <li><b>Rate:</b> $${roomRate} / night</li>
            <li><b>Check-in:</b> ${new Date(reservation.checkin).toLocaleDateString()}</li>
            <li><b>Check-out:</b> ${now.toLocaleDateString()}</li>
            <li><b>Nights Stayed:</b> ${nights}</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Charges</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Room Charge:</b> $${roomCharge}</li>
            ${extraDetails.length > 0 ? extraDetails.map(e => `<li><b>${e.name}:</b> $${e.price}</li>`).join('') : '<li>No extra services</li>'}
            <li style="margin-top:8px;"><b>Total:</b> $${total}</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">We hope you enjoyed your stay!<br>For any queries, contact us at support@example.com.</p>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Reservation System</p>
      </div>
    `;

    // Update reservation
    reservation.status = 'Checked Out';
    reservation.actualCheckout = now;
    reservation.bill = bill;
    reservation.invoiceHtml = invoiceHtml;
    await reservation.save();

    // Update room status
    await Rooms.findByIdAndUpdate(reservation.room._id, { status: 'Vacant' });

    // Email invoice
    try {
      await EmailController.sendMail(reservation.guestEmail, 'Your Hotel Invoice', invoiceHtml);
    } catch (e) {
      // Log but don't fail checkout
      console.error('Invoice email error:', e);
    }

    res.status(200).json({ message: 'Checked out successfully', reservation, invoice: invoiceHtml });
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

// Get reservation by MongoDB _id
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id).populate('room');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.status(200).json({ reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservation', error: error.message });
  }
};