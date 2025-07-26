import Rooms from '../Modals/RoomsModal.mjs';
import Users from '../Modals/UsersModal.mjs';
import Reservation from '../Modals/ReservationModal.mjs';

// Get comprehensive analytics data
export const getAnalytics = async (req, res) => {
  try {
    // Room Status Analytics
    const totalRooms = await Rooms.countDocuments();
    const occupiedRooms = await Rooms.countDocuments({ status: 'Occupied' });
    const vacantRooms = await Rooms.countDocuments({ status: 'Vacant' });
    const maintenanceRooms = await Rooms.countDocuments({ status: 'Maintenance' });
    
    // Reserved rooms (rooms with confirmed reservations for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservedRooms = await Reservation.countDocuments({
      status: 'Confirmed',
      checkin: { $lte: today },
      checkout: { $gt: today }
    });

    // Staff Information
    const staffRoles = ['receptionist', 'housekeeping', 'maintenance', 'manager'];
    const staffInfo = [];
    
    for (const role of staffRoles) {
      const totalStaff = await Users.countDocuments({ role });
      const activeStaff = await Users.countDocuments({ role, isActive: true });
      staffInfo.push({
        role,
        count: totalStaff,
        active: activeStaff
      });
    }

    // Reservation Statistics
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });
    const confirmedReservations = await Reservation.countDocuments({ status: 'Confirmed' });
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
          actualCheckout: { $gte: startOfDay, $lte: endOfDay }
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
          actualCheckout: { $gte: startOfMonth, $lte: endOfMonth }
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
          actualCheckout: { $gte: startOfYear, $lte: endOfYear }
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
            actualCheckout: { $gte: monthStart, $lte: monthEnd }
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
          actualCheckout: { $gte: previousMonthStart, $lte: previousMonthEnd }
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

    const analyticsData = {
      roomStatus: {
        total: totalRooms,
        occupied: occupiedRooms,
        vacant: vacantRooms,
        maintenance: maintenanceRooms,
        reserved: reservedRooms
      },
      staffInfo,
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
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
      monthlyData
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
  }
};

export default { getAnalytics }; 