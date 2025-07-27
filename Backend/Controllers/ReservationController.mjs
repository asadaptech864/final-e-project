import Reservation from '../Modals/ReservationModal.mjs';
import Rooms from '../Modals/RoomsModal.mjs';
import EmailController from './EmailController.mjs';
import Notification from '../Modals/NotificationModal.mjs';

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
    console.log('🔍 DEBUG - createReservation overlapping check:');
    console.log('Room:', room);
    console.log('Checkin:', new Date(checkin));
    console.log('Checkout:', new Date(checkout));
    
    const overlapping = await Reservation.findOne({
      room,
      status: { $nin: ["Cancelled", "Checked Out"] }, // Only consider non-cancelled reservations
      $or: [
        // Case 1: Reservation starts before checkout and ends after checkin
        { 
          checkin: { $lt: new Date(checkout) }, 
          checkout: { $gt: new Date(checkin) } 
        },
        // Case 2: Reservation completely contains the requested period
        {
          checkin: { $lte: new Date(checkin) },
          checkout: { $gte: new Date(checkout) }
        }
      ],
    });
    
    console.log('Overlapping reservation found:', overlapping ? overlapping.reservationId : 'None');
    if (overlapping) {
      console.log('Overlapping details:', {
        reservationId: overlapping.reservationId,
        checkin: overlapping.checkin,
        checkout: overlapping.checkout,
        status: overlapping.status
      });
    }
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
    
    // Create notification for reservation creation
    try {
      await Notification.create({
        userId: guestId,
        type: 'reservation',
        message: `Reservation ${reservationId} created successfully. ${role === 'receptionist' ? 'Status: Confirmed' : 'Status: Pending - Payment required'}`,
        data: { 
          reservationId, 
          status: status || 'Pending',
          roomId: room,
          checkin,
          checkout,
          price
        },
      });
    } catch (e) {
      console.error('Notification creation error:', e);
    }
    
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

    // Convert dates to Date objects and handle timezone correctly
    // Parse the date string and create a local date object
    const parseLocalDate = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    };
    
    const checkinDate = parseLocalDate(checkin);
    const checkoutDate = parseLocalDate(checkout);

    // Also parse existing reservations to local dates for comparison
    const parseReservationDate = (date) => {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    };

    console.log('🔍 DEBUG - getAvailableRooms:');
    console.log('Requested checkin:', checkinDate);
    console.log('Requested checkout:', checkoutDate);

    // Get all confirmed reservations first
    const allConfirmedReservations = await Reservation.find({
      status: { $nin: ["Cancelled", "Checked Out"] }
    }).populate('room');

    // Check for conflicts manually with proper date parsing
    const conflictingReservations = [];
    allConfirmedReservations.forEach(reservation => {
      const resCheckin = parseReservationDate(reservation.checkin);
      const resCheckout = parseReservationDate(reservation.checkout);
      
      // Check for overlap
      const hasConflict = (
        (resCheckin < checkoutDate && resCheckout > checkinDate) ||
        (resCheckin <= checkinDate && resCheckout >= checkoutDate)
      );
      
      if (hasConflict) {
        conflictingReservations.push(reservation);
      }
    });

    console.log('🔍 Found conflicting reservations:', conflictingReservations.length);
    conflictingReservations.forEach(res => {
      console.log(`- Room: ${res.room}, Checkin: ${res.checkin}, Checkout: ${res.checkout}, Status: ${res.status}`);
    });

    // Get the room IDs that have conflicts
    const conflictingRoomIds = [...new Set(conflictingReservations.map(res => res.room._id || res.room))];
    console.log('🔍 Conflicting room IDs:', conflictingRoomIds);

    // Find all rooms that are NOT in the conflicting list
    const availableRooms = await Rooms.find({ 
      _id: { $nin: conflictingRoomIds },
      status: { $in: ["Available", "Clean"] } // Only show Available or Clean rooms
    });

    // console.log('🔍 Available rooms found:', availableRooms.length);
    // availableRooms.forEach(room => {
    //   console.log(`- Available room: ${room.name} (${room._id})`);
    // });

    res.status(200).json({ availableRooms });
  } catch (error) {
    console.error('Error in getAvailableRooms:', error);
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

    // Get system settings for rates and taxes
    const Settings = (await import('../Modals/SettingsModal.mjs')).default;
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ message: 'System settings not found' });
    }

    // Calculate actual stay duration
    const checkinDate = new Date(reservation.checkin);
    const now = new Date();
    now.setHours(0,0,0,0);
    checkinDate.setHours(0,0,0,0);
    let nights = Math.ceil((now - checkinDate) / (1000 * 60 * 60 * 24));
    if (nights < 1) nights = 1;

    // Calculate room charges using settings-based pricing
    let totalRoomCharge = 0;
    const nightlyRates = [];
    const currentDate = new Date(checkinDate);
    
    for (let i = 0; i < nights; i++) {
      const nightlyRate = calculateRoomRateForDate(reservation.room.roomType, currentDate, settings);
      totalRoomCharge += nightlyRate;
      nightlyRates.push({
        date: new Date(currentDate).toLocaleDateString(),
        rate: nightlyRate
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Extra services (example: spa $50, wakeup $10, airport $30)
    let extra = 0;
    let extraDetails = [];
    if (reservation.additionalServices?.spa) { extra += 50; extraDetails.push({ name: 'Spa', price: 50 }); }
    if (reservation.additionalServices?.wakeup) { extra += 10; extraDetails.push({ name: 'Wake-up Call', price: 10 }); }
    if (reservation.additionalServices?.airport) { extra += 30; extraDetails.push({ name: 'Airport Pickup', price: 30 }); }

    // Calculate subtotal before taxes
    const subtotal = totalRoomCharge + extra;

    // Calculate taxes and charges from settings
    let taxAmount = 0;
    let serviceCharge = 0;
    let cityTax = 0;
    let stateTax = 0;
    const taxBreakdown = [];

    if (settings.taxes) {
      if (settings.taxes.taxRate) {
        const taxRate = settings.taxes.taxRate;
        taxAmount = (subtotal * taxRate) / 100;
        taxBreakdown.push({ name: `Tax (${taxRate}%)`, amount: taxAmount });
      }
      if (settings.taxes.serviceCharge) {
        serviceCharge = settings.taxes.serviceCharge;
        taxBreakdown.push({ name: 'Service Charge', amount: serviceCharge });
      }
      if (settings.taxes.cityTax) {
        cityTax = settings.taxes.cityTax;
        taxBreakdown.push({ name: 'City Tax', amount: cityTax });
      }
      if (settings.taxes.stateTax) {
        stateTax = settings.taxes.stateTax;
        taxBreakdown.push({ name: 'State Tax', amount: stateTax });
      }
    }

    // Total including all taxes and charges
    const total = subtotal + taxAmount + serviceCharge + cityTax + stateTax;

    // Bill breakdown
    const bill = {
      nights,
      nightlyRates,
      totalRoomCharge,
      extraServices: extraDetails,
      extraTotal: extra,
      subtotal,
      taxes: taxBreakdown,
      totalTaxes: taxAmount + serviceCharge + cityTax + stateTax,
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
            <li><b>Check-in:</b> ${new Date(reservation.checkin).toLocaleDateString()}</li>
            <li><b>Check-out:</b> ${now.toLocaleDateString()}</li>
            <li><b>Nights Stayed:</b> ${nights}</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Nightly Rates</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            ${nightlyRates.map(rate => `<li><b>${rate.date}:</b> $${rate.rate}</li>`).join('')}
          </ul>
        </div>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <h3 style="color:#333;margin-bottom:8px;">Charges</h3>
          <ul style="list-style:none;padding:0;font-size:15px;">
            <li><b>Room Charge:</b> $${totalRoomCharge}</li>
            ${extraDetails.length > 0 ? extraDetails.map(e => `<li><b>${e.name}:</b> $${e.price}</li>`).join('') : '<li>No extra services</li>'}
            <li style="margin-top:8px;border-top:1px solid #eee;padding-top:8px;"><b>Subtotal:</b> $${subtotal}</li>
            ${taxBreakdown.map(tax => `<li><b>${tax.name}:</b> $${tax.amount.toFixed(2)}</li>`).join('')}
            <li style="margin-top:8px;border-top:1px solid #eee;padding-top:8px;font-weight:bold;font-size:16px;"><b>Total:</b> $${total.toFixed(2)}</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">We hope you enjoyed your stay!<br>For any queries, contact us at ${settings.general?.contactEmail || 'support@example.com'}.</p>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} ${settings.general?.hotelName || 'Hotel Reservation System'}</p>
      </div>
    `;

    // Update reservation
    reservation.status = 'Checked Out';
    reservation.actualCheckout = now;
    reservation.bill = bill;
    reservation.invoiceHtml = invoiceHtml;
    await reservation.save();

    // Update room status
    await Rooms.findByIdAndUpdate(reservation.room._id, { status: 'Available' });

    // Create notification for checkout
    try {
      await Notification.create({
        userId: reservation.guestId,
        type: 'reservation',
        message: `Checkout completed for reservation ${reservation.reservationId}. Total amount: $${total.toFixed(2)}`,
        data: { 
          reservationId: reservation.reservationId, 
          status: 'Checked Out',
          roomId: reservation.room._id,
          total: total.toFixed(2),
          bill
        },
      });
    } catch (e) {
      console.error('Checkout notification error:', e);
    }

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

// Helper function to calculate room rate for a specific date
const calculateRoomRateForDate = (roomType, date, settings) => {
  if (!settings || !settings.roomRates) {
    return 0;
  }

  const roomRate = settings.roomRates.find(rate => rate.roomType === roomType);
  if (!roomRate) {
    return 0;
  }

  // Check if it's a weekend (Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check if it's a holiday (basic implementation)
  const isHoliday = isHolidayDate(date);

  // Check seasonal rates
  const seasonalRate = getSeasonalRate(date, roomRate.seasonalRates);

  // Priority: Seasonal > Holiday > Weekend > Base
  if (seasonalRate > 0) {
    return seasonalRate;
  } else if (isHoliday && roomRate.holidayRate > 0) {
    return roomRate.holidayRate;
  } else if (isWeekend && roomRate.weekendRate > 0) {
    return roomRate.weekendRate;
  } else {
    return roomRate.baseRate;
  }
};

// Helper function to check if a date is a holiday
const isHolidayDate = (date) => {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Basic holiday check (you can expand this)
  const holidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 6, day: 4 },   // Independence Day
    { month: 11, day: 25 }, // Christmas
  ];

  return holidays.some(holiday => holiday.month === month && holiday.day === day);
};

// Helper function to get seasonal rate for a specific date
const getSeasonalRate = (date, seasonalRates) => {
  if (!seasonalRates || seasonalRates.length === 0) {
    return 0;
  }

  const currentDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  for (const seasonalRate of seasonalRates) {
    if (currentDate >= seasonalRate.startDate && currentDate <= seasonalRate.endDate) {
      return seasonalRate.rate;
    }
  }

  return 0;
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
    ).populate('room');
    
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Create notification for cancellation
    try {
      await Notification.create({
        userId: reservation.guestId,
        type: 'reservation',
        message: `Reservation ${reservation.reservationId} has been cancelled by ${name} (${role})`,
        data: { 
          reservationId: reservation.reservationId, 
          status: 'Cancelled',
          roomId: reservation.room._id,
          cancelledBy: { userId, name, role }
        },
      });
    } catch (e) {
      console.error('Cancellation notification error:', e);
    }

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

// Test endpoint to debug date filtering
export const testDateFiltering = async (req, res) => {
  try {
    const { checkin, checkout } = req.query;
    if (!checkin || !checkout) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
    }

    // Convert dates to Date objects and set time to start of day
    const checkinDate = new Date(checkin);
    checkinDate.setHours(0, 0, 0, 0);
    const checkoutDate = new Date(checkout);
    checkoutDate.setHours(0, 0, 0, 0);

    console.log('🔍 TEST - Date Filtering Debug:');
    console.log('Requested checkin:', checkinDate);
    console.log('Requested checkout:', checkoutDate);

    // Get all reservations
    const allReservations = await Reservation.find({}).populate('room').select('reservationId checkin checkout status room');
    console.log('Total reservations:', allReservations.length);

    // Get all confirmed reservations
    const confirmedReservations = await Reservation.find({ 
      status: { $nin: ["Cancelled", "Checked Out"] }
    }).populate('room').select('reservationId checkin checkout status room');
    console.log('Confirmed reservations (not cancelled/checked out):', confirmedReservations.length);

    // Log all confirmed reservations
    confirmedReservations.forEach(res => {
      console.log(`- ${res.reservationId}: ${res.checkin} to ${res.checkout}, Room: ${res.room?.name || res.room}, Status: ${res.status}`);
    });

    // Check each reservation for conflicts
    const conflicts = [];
    confirmedReservations.forEach(res => {
      const resCheckin = new Date(res.checkin);
      const resCheckout = new Date(res.checkout);
      
      // Check for overlap
      const hasConflict = (
        (resCheckin < checkoutDate && resCheckout > checkinDate) ||
        (resCheckin <= checkinDate && resCheckout >= checkoutDate)
      );
      
      if (hasConflict) {
        conflicts.push({
          reservationId: res.reservationId,
          checkin: resCheckin,
          checkout: resCheckout,
          room: res.room?.name || res.room,
          status: res.status,
          conflict: true
        });
      }
    });

    console.log('Conflicts found:', conflicts.length);
    conflicts.forEach(conflict => {
      console.log(`- ${conflict.reservationId}: ${conflict.checkin} to ${conflict.checkout}, Room: ${conflict.room}`);
    });

    res.status(200).json({
      requestedDates: { checkin: checkinDate, checkout: checkoutDate },
      totalReservations: allReservations.length,
      confirmedReservations: confirmedReservations.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
      allConfirmedReservations: confirmedReservations.map(r => ({
        reservationId: r.reservationId,
        checkin: r.checkin,
        checkout: r.checkout,
        room: r.room?.name || r.room,
        status: r.status
      }))
    });
  } catch (error) {
    console.error('Error in testDateFiltering:', error);
    res.status(500).json({ message: 'Error in test endpoint', error: error.message });
  }
};