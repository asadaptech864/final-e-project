import Reservation from '../Modals/ReservationModal.mjs';
import Rooms from '../Modals/RoomsModal.mjs';

// Create a reservation
export const createReservation = async (req, res) => {
  try {
    const { room, guestName, guestEmail, guestPhone, guestId, checkin, checkout, guests, additionalServices } = req.body;
    // console.log('Reservation request body:', req.body);
    // Check if room is available for the given dates
    const overlapping = await Reservation.findOne({
      room,
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
    const reservation = new Reservation({ room, guestName, guestEmail, guestPhone, guestId, checkin, checkout, guests, additionalServices });
    await reservation.save();
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
    if (!guestId) {
      return res.status(400).json({ message: 'guestId is required' });
    }
    const reservations = await Reservation.find({ guestId }).populate('room');
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
}; 