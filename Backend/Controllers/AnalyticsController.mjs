import Rooms from '../Modals/RoomsModal.mjs';
import Users from '../Modals/UsersModal.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
import Maintenance from '../Modals/MaintenanceModal.mjs';

// Get comprehensive analytics data
export const getAnalytics = async (req, res) => {
  try {
    // Room Status Analytics - Get all room statuses
    const totalRooms = await Rooms.countDocuments();
    const occupiedRooms = await Rooms.countDocuments({ status: 'Occupied' });
    const availableRooms = await Rooms.countDocuments({ status: 'Available' });
    const maintenanceRooms = await Rooms.countDocuments({ status: 'Maintenance' });
    const cleaningRooms = await Rooms.countDocuments({ status: 'Cleaning' });
    const cleanRooms = await Rooms.countDocuments({ status: 'Clean' });
    
    // Reserved rooms (rooms with confirmed reservations for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all confirmed reservations that overlap with today
    const confirmedReservations = await Reservation.find({
      status: 'Confirmed', 
      $or: [
        // Reservations that start today
        { checkin: { $gte: today, $lt: tomorrow } },
        // Reservations that are ongoing (started before today and end after today)
        { 
          checkin: { $lt: today },
          checkout: { $gt: today }
        }
      ]
    });

    // Count unique rooms that are reserved
    const reservedRoomIds = [...new Set(confirmedReservations.map(res => res.room?.toString()).filter(Boolean))];
    const reservedRooms = reservedRoomIds.length;

    // Non-reserved rooms = total rooms - reserved rooms
    const nonReservedRooms = Math.max(0, totalRooms - reservedRooms);

    // Staff Information
    const staffRoles = ['receptionist', 'housekeeping', 'maintenance', 'manager'];
    const staffInfo = [];
    
    for (const role of staffRoles) {
      try {
        const totalStaff = await Users.countDocuments({ role });
        const activeStaff = await Users.countDocuments({ role, isActive: true });
        staffInfo.push({
          role,
          count: totalStaff,
          active: activeStaff
        });
      } catch (error) {
        console.error(`Error fetching staff info for role ${role}:`, error);
        staffInfo.push({
          role,
          count: 0,
          active: 0
        });
      }
    }

    // Reservation Statistics
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });
    const confirmedReservationsCount = await Reservation.countDocuments({ status: 'Confirmed' });
    const checkedInReservations = await Reservation.countDocuments({ status: 'Checked In' });
    const checkedOutReservations = await Reservation.countDocuments({ status: 'Checked Out' });
    const cancelledReservations = await Reservation.countDocuments({ status: 'Cancelled' });

    // Revenue Analytics
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Calculate daily revenue (from checked out reservations today)
    const dailyRevenue = await Reservation.aggregate([
      {
        $match: {
          status: 'Checked Out',
          actualCheckout: { $gte: startOfDay, $lte: endOfDay },
          'bill.total': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$bill.total' }
        }
      }
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = await Reservation.aggregate([
      {
        $match: {
          status: 'Checked Out',
          actualCheckout: { $gte: startOfMonth, $lte: endOfMonth },
          'bill.total': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$bill.total' }
        }
      }
    ]);

    // Calculate yearly revenue
    const yearlyRevenue = await Reservation.aggregate([
      {
        $match: {
          status: 'Checked Out',
          actualCheckout: { $gte: startOfYear, $lte: endOfYear },
          'bill.total': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$bill.total' }
        }
      }
    ]);

    // Monthly data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthRevenue = await Reservation.aggregate([
        {
          $match: {
            status: 'Checked Out',
            actualCheckout: { $gte: monthStart, $lte: monthEnd },
            'bill.total': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$bill.total' }
          }
        }
      ]);

      const monthOccupancy = await Reservation.aggregate([
        {
          $match: {
            status: { $in: ['Confirmed', 'Checked In'] },
            checkin: { $lte: monthEnd },
            checkout: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue[0]?.total || 0,
        occupancy: monthOccupancy[0]?.count || 0
      });
    }

    // Calculate revenue trend (compare with previous period)
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
    
    const previousMonthRevenue = await Reservation.aggregate([
      {
        $match: {
          status: 'Checked Out',
          actualCheckout: { $gte: previousMonthStart, $lte: previousMonthEnd },
          'bill.total': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$bill.total' }
        }
      }
    ]);

    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const prevMonthRevenue = previousMonthRevenue[0]?.total || 0;
    const revenueTrend = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

    // --- Maintenance Analytics ---
    // Total maintenance requests
    const totalMaintenance = await Maintenance.countDocuments();
    // Created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const dailyMaintenance = await Maintenance.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } });
    // Created this month
    const startOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthlyMaintenance = await Maintenance.countDocuments({ createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth } });
    // Created this year
    const startOfThisYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfThisYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    const yearlyMaintenance = await Maintenance.countDocuments({ createdAt: { $gte: startOfThisYear, $lte: endOfThisYear } });
    // Assigned/unassigned
    const assignedMaintenance = await Maintenance.countDocuments({ assignedTo: { $ne: null } });
    const unassignedMaintenance = await Maintenance.countDocuments({ assignedTo: null });
    // Status breakdown
    const statusAgg = await Maintenance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusBreakdown = {};
    statusAgg.forEach(s => { statusBreakdown[s._id] = s.count; });
    // Per-user assignment count and status
    const userAgg = await Maintenance.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: { user: '$assignedTo', userName: '$user.name', status: '$status' }, count: { $sum: 1 } } }
    ]);
    // Format per-user breakdown
    const perUser = {};
    for (const entry of userAgg) {
      const userId = entry._id.user?.toString() || 'Unassigned';
      const userName = entry._id.userName || 'Unknown User';
      if (!perUser[userId]) perUser[userId] = { name: userName };
      perUser[userId][entry._id.status] = entry.count;
    }
    // Monthly maintenance trend data
    const monthlyMaintenanceData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthMaintenance = await Maintenance.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      monthlyMaintenanceData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        count: monthMaintenance
      });
    }

    const analyticsData = {
      roomStatus: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
        maintenance: maintenanceRooms,
        cleaning: cleaningRooms,
        clean: cleanRooms,
        reserved: reservedRooms,
        nonReserved: nonReservedRooms
      },
      staffInfo,
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservationsCount,
        checkedIn: checkedInReservations,
        checkedOut: checkedOutReservations,
        cancelled: cancelledReservations
      },
      revenue: {
        daily: dailyRevenue[0]?.total || 0,
        monthly: currentMonthRevenue,
        yearly: yearlyRevenue[0]?.total || 0,
        trend: revenueTrend
      },
      monthlyData,
      maintenance: {
        total: totalMaintenance,
        daily: dailyMaintenance,
        monthly: monthlyMaintenance,
        yearly: yearlyMaintenance,
        assigned: assignedMaintenance,
        unassigned: unassignedMaintenance,
        statusBreakdown,
        perUser,
        monthlyData: monthlyMaintenanceData
      }
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
  }
};

// Test endpoint to debug reservation data
export const testReservations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('🔍 TEST - Reservation Debug:');
    console.log('Today:', today);
    console.log('Tomorrow:', tomorrow);
    
    // Get all reservations
    const allReservations = await Reservation.find({}).select('reservationId checkin checkout status');
    console.log('Total reservations:', allReservations.length);
    
    // Get confirmed reservations
    const confirmedReservations = await Reservation.find({ status: 'Confirmed' }).select('reservationId checkin checkout status');
    console.log('Confirmed reservations:', confirmedReservations.length);
    
    confirmedReservations.forEach(res => {
      const checkinDate = new Date(res.checkin);
      const checkoutDate = new Date(res.checkout);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      const overlaps = checkinDate <= todayDate && checkoutDate > todayDate;
      const startsToday = checkinDate >= todayDate && checkinDate < tomorrow;
      
      console.log(`- ${res.reservationId}: ${checkinDate} to ${checkoutDate} - Overlaps: ${overlaps}, Starts Today: ${startsToday}`);
    });
    
    res.status(200).json({
      today: today,
      tomorrow: tomorrow,
      totalReservations: allReservations.length,
      confirmedReservations: confirmedReservations.length,
      reservations: confirmedReservations
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: 'Error in test endpoint', error: error.message });
  }
};

export default { getAnalytics, testReservations }; 