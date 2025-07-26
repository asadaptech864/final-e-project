import Settings from '../Modals/SettingsModal.mjs';

// Get all system settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        general: {
          hotelName: "Luxury Hotel",
          contactEmail: "info@luxuryhotel.com",
          contactPhone: "+1-555-0123",
          address: "123 Luxury Street, City, State 12345",
          timezone: "America/New_York",
          currency: "USD"
        },
        policies: {
          checkInTime: "15:00",
          checkOutTime: "11:00",
          cancellationPolicy: "Free cancellation up to 24 hours before check-in",
          petPolicy: "Pets allowed with additional fee",
          smokingPolicy: "No smoking in rooms",
          maxGuestsPerRoom: 4
        },
        taxes: {
          taxRate: 8.5,
          serviceCharge: 10.0,
          cityTax: 2.0,
          stateTax: 6.0
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          bookingAlerts: true,
          maintenanceAlerts: true,
          paymentAlerts: true
        },
        roomRates: [
          {
            roomType: "Standard Room",
            baseRate: 86,
            weekendRate: 95,
            holidayRate: 110,
            seasonalRates: []
          },
          {
            roomType: "Deluxe Room",
            baseRate: 180,
            weekendRate: 200,
            holidayRate: 220,
            seasonalRates: []
          },
          {
            roomType: "Suite",
            baseRate: 350,
            weekendRate: 400,
            holidayRate: 450,
            seasonalRates: []
          },
          {
            roomType: "Suite Room",
            baseRate: 86,
            weekendRate: 95,
            holidayRate: 110,
            seasonalRates: []
          },
          {
            roomType: "Family Room",
            baseRate: 120,
            weekendRate: 140,
            holidayRate: 160,
            seasonalRates: []
          }
        ]
      });
      await settings.save();
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update specific settings section
export const updateSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    // Update the specific section
    settings[section] = updateData;
    await settings.save();
    
    res.status(200).json({ 
      message: `${section} settings updated successfully`, 
      settings: settings[section] 
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Update room rates specifically
export const updateRoomRates = async (req, res) => {
  try {
    const { roomRates } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    settings.roomRates = roomRates;
    await settings.save();
    
    res.status(200).json({ 
      message: 'Room rates updated successfully', 
      roomRates: settings.roomRates 
    });
  } catch (error) {
    console.error('Room rates update error:', error);
    res.status(500).json({ message: 'Error updating room rates', error: error.message });
  }
};

// Get specific settings section
export const getSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    if (!settings[section]) {
      return res.status(404).json({ message: `Section ${section} not found` });
    }
    
    res.status(200).json(settings[section]);
  } catch (error) {
    console.error('Settings section fetch error:', error);
    res.status(500).json({ message: 'Error fetching settings section', error: error.message });
  }
};

export default { 
  getSettings, 
  updateSettings, 
  updateRoomRates, 
  getSettingsSection 
}; 