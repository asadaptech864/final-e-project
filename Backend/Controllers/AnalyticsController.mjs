import Rooms from '../Modals/RoomsModal.mjs';
import Users from '../Modals/UsersModal.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
import Maintenance from '../Modals/MaintenanceModal.mjs';
import Feedback from '../Modals/FeedbackModal.mjs';

// Get comprehensive analytics data
export const getAnalytics = async (req, res) => {
  try {
    console.log('🚀 Starting analytics data fetch...');
    const startTime = Date.now();

    // Execute all queries in parallel for better performance
    const [
      roomStatusAggregation,
      staffInfoAggregation,
      reservationStatsAggregation,
      confirmedReservations,
      revenueData,
      maintenanceData,
      feedbackData,
      maintenanceStatusBreakdown,
      maintenanceAssignedUsers,
      monthlyMaintenanceTrend,
      monthlyRevenueTrend
    ] = await Promise.all([
      // Room Status Analytics - Single aggregation query
      Rooms.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            occupied: { $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } },
            available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] } },
            cleaning: { $sum: { $cond: [{ $eq: ['$status', 'Cleaning'] }, 1, 0] } },
            clean: { $sum: { $cond: [{ $eq: ['$status', 'Clean'] }, 1, 0] } }
          }
        }
      ]),

      // Staff Information - Single aggregation query
      Users.aggregate([
        {
          $match: {
            role: { $in: ['receptionist', 'housekeeping', 'maintenance', 'manager'] }
          }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),

      // Reservation Statistics - Single aggregation query
      Reservation.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] } },
            checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'Checked In'] }, 1, 0] } },
            checkedOut: { $sum: { $cond: [{ $eq: ['$status', 'Checked Out'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } }
          }
        }
      ]),

      // Reserved rooms calculation
      Reservation.find({
        status: 'Confirmed',
        $or: [
          { checkin: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(0, 0, 0, 0) + 86400000 } },
          { 
            checkin: { $lt: new Date().setHours(0, 0, 0, 0) },
            checkout: { $gt: new Date().setHours(0, 0, 0, 0) }
          }
        ]
      }).select('room').lean(),

      // Revenue Analytics - Optimized aggregation
      Reservation.aggregate([
        {
          $match: {
            status: 'Checked Out',
            'bill.total': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            daily: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$actualCheckout', new Date().setHours(0, 0, 0, 0)] },
                      { $lte: ['$actualCheckout', new Date().setHours(23, 59, 59, 999)] }
                    ]
                  },
                  '$bill.total',
                  0
                ]
              }
            },
            monthly: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$actualCheckout', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                      { $lte: ['$actualCheckout', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)] }
                    ]
                  },
                  '$bill.total',
                  0
                ]
              }
            },
            yearly: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$actualCheckout', new Date(new Date().getFullYear(), 0, 1)] },
                      { $lte: ['$actualCheckout', new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)] }
                    ]
                  },
                  '$bill.total',
                  0
                ]
              }
            }
          }
        }
      ]),

      // Maintenance Analytics - Optimized aggregation
      Maintenance.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            daily: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', new Date().setHours(0, 0, 0, 0)] },
                      { $lte: ['$createdAt', new Date().setHours(23, 59, 59, 999)] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            monthly: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                      { $lte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            yearly: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', new Date(new Date().getFullYear(), 0, 1)] },
                      { $lte: ['$createdAt', new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            assigned: {
              $sum: {
                $cond: [
                  { $ne: ['$assignedTo', null] },
                  1,
                  0
                ]
              }
            },
            unassigned: {
              $sum: {
                $cond: [
                  { $eq: ['$assignedTo', null] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Feedback Analytics - Optimized aggregation
      Feedback.aggregate([
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomData'
          }
        },
        {
          $unwind: {
            path: '$roomData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingBreakdown: {
              $push: {
                rating: '$rating',
                count: 1
              }
            },
            recentReviews: {
              $push: {
                _id: '$_id',
                guestName: '$guestName',
                rating: '$rating',
                comment: '$comment',
                roomName: '$roomData.name',
                createdAt: '$createdAt'
              }
            },
            roomRatings: {
              $push: {
                roomId: '$roomId',
                roomName: '$roomData.name',
                rating: '$rating',
                cleanliness: '$cleanliness',
                comfort: '$comfort',
                service: '$service',
                value: '$value'
              }
            }
          }
        }
      ]),

      // Maintenance Status Breakdown - Optimized aggregation
      Maintenance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Maintenance Assigned to Users - Optimized aggregation
      Maintenance.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedUser'
          }
        },
        {
          $unwind: {
            path: '$assignedUser',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              userId: '$assignedTo',
              status: '$status'
            },
            name: { $first: '$assignedUser.name' },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            '_id.userId': { $ne: null }
          }
        },
        {
          $group: {
            _id: '$_id.userId',
            name: { $first: '$name' },
            statusCounts: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]),

      // Monthly Maintenance Trend - Optimized aggregation
      Maintenance.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        },
        {
          $limit: 6
        }
      ]),

      // Monthly Revenue Trend - Optimized aggregation
      Reservation.aggregate([
        {
          $match: {
            status: 'Checked Out',
            'bill.total': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$actualCheckout' },
              month: { $month: '$actualCheckout' }
            },
            revenue: { $sum: '$bill.total' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        },
        {
          $limit: 6
        }
      ])
    ]);

    console.log(`⏱️  Parallel queries completed in ${Date.now() - startTime}ms`);

    // Extract data from aggregation results
    const roomStatus = roomStatusAggregation[0] || { total: 0, occupied: 0, available: 0, maintenance: 0, cleaning: 0, clean: 0 };
    const reservedRooms = new Set(confirmedReservations.map(res => res.room?.toString()).filter(Boolean)).size;
    const nonReservedRooms = Math.max(0, roomStatus.total - reservedRooms);

    // Process staff info
    const staffInfo = staffInfoAggregation.map(staff => ({
      role: staff._id,
      count: staff.count,
      active: staff.active
    }));

    // Process reservation stats
    const reservationStats = reservationStatsAggregation[0] || { total: 0, pending: 0, confirmed: 0, checkedIn: 0, checkedOut: 0, cancelled: 0 };

    // Process revenue data
    const revenueResult = revenueData[0] || { daily: 0, monthly: 0, yearly: 0 };

    // Process maintenance data
    const maintenanceResult = maintenanceData[0] || { total: 0, daily: 0, monthly: 0, yearly: 0, assigned: 0, unassigned: 0 };

    // Process feedback data
    const feedbackResult = feedbackData[0];
    const feedbackTotalReviews = feedbackResult?.totalReviews || 0;
    const feedbackAverageRating = feedbackResult?.averageRating || 0;
    
    // Process rating breakdown
    const feedbackRatingBreakdown = {};
    if (feedbackResult?.ratingBreakdown) {
      feedbackResult.ratingBreakdown.forEach(item => {
        feedbackRatingBreakdown[item.rating] = (feedbackRatingBreakdown[item.rating] || 0) + item.count;
      });
    }

    // Process room ratings
    const feedbackRoomRatingsMap = new Map();
    if (feedbackResult?.roomRatings) {
      feedbackResult.roomRatings.forEach(feedback => {
        if (feedback.roomId) {
          const roomId = feedback.roomId.toString();
          if (!feedbackRoomRatingsMap.has(roomId)) {
            feedbackRoomRatingsMap.set(roomId, {
              roomId,
              roomName: feedback.roomName || 'Unknown Room',
              ratings: [],
              cleanliness: [],
              comfort: [],
              service: [],
              value: []
            });
          }
          const roomData = feedbackRoomRatingsMap.get(roomId);
          roomData.ratings.push(feedback.rating);
          roomData.cleanliness.push(feedback.cleanliness);
          roomData.comfort.push(feedback.comfort);
          roomData.service.push(feedback.service);
          roomData.value.push(feedback.value);
        }
      });
    }

    const feedbackRoomRatings = Array.from(feedbackRoomRatingsMap.values()).map(room => ({
      roomId: room.roomId,
      roomName: room.roomName,
      averageRating: room.ratings.length > 0 ? room.ratings.reduce((sum, r) => sum + r, 0) / room.ratings.length : 0,
      totalReviews: room.ratings.length,
      cleanliness: room.cleanliness.length > 0 ? room.cleanliness.reduce((sum, c) => sum + c, 0) / room.cleanliness.length : 0,
      comfort: room.comfort.length > 0 ? room.comfort.reduce((sum, c) => sum + c, 0) / room.comfort.length : 0,
      service: room.service.length > 0 ? room.service.reduce((sum, s) => sum + s, 0) / room.service.length : 0,
      value: room.value.length > 0 ? room.value.reduce((sum, v) => sum + v, 0) / room.value.length : 0
    }));

    // Process recent reviews
    const feedbackRecentReviews = feedbackResult?.recentReviews?.slice(0, 10) || [];

    // Process maintenance status breakdown
    const statusBreakdown = {};
    maintenanceStatusBreakdown.forEach(item => {
      statusBreakdown[item._id] = item.count;
    });

    // Process maintenance assigned to users
    const perUser = {};
    maintenanceAssignedUsers.forEach(item => {
      if (item._id) {
        const userData = {
          name: item.name || 'Unknown User',
          total: item.total
        };
        
        // Add status counts dynamically
        item.statusCounts.forEach(statusCount => {
          userData[statusCount.status] = statusCount.count;
        });
        
        perUser[item._id.toString()] = userData;
      }
    });

    // Process monthly maintenance trend
    const monthlyMaintenanceData = monthlyMaintenanceTrend.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: item.count
    }));

    // Process monthly revenue trend with occupancy data
    const monthlyData = monthlyRevenueTrend.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: item.revenue,
      occupancy: item.count // Using count as occupancy for the original design
    }));

    // Calculate revenue trend (compare current month with previous month)
    const currentMonth = new Date().getMonth() + 1; // MongoDB months are 1-indexed
    const currentYear = new Date().getFullYear();
    const currentMonthData = monthlyRevenueTrend.find(item => 
      item._id.year === currentYear && item._id.month === currentMonth
    );
    const previousMonthData = monthlyRevenueTrend.find(item => 
      item._id.year === currentYear && item._id.month === currentMonth - 1
    ) || monthlyRevenueTrend.find(item => 
      item._id.year === currentYear - 1 && item._id.month === 12
    );

    const currentMonthRevenue = currentMonthData?.revenue || 0;
    const previousMonthRevenue = previousMonthData?.revenue || 0;
    const revenueTrend = previousMonthRevenue > 0 ? 
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

    const analyticsData = {
      roomStatus: {
        total: roomStatus.total,
        occupied: roomStatus.occupied,
        available: roomStatus.available,
        maintenance: roomStatus.maintenance,
        cleaning: roomStatus.cleaning,
        clean: roomStatus.clean,
        reserved: reservedRooms,
        nonReserved: nonReservedRooms
      },
      staffInfo,
      reservations: {
        total: reservationStats.total,
        pending: reservationStats.pending,
        confirmed: reservationStats.confirmed,
        checkedIn: reservationStats.checkedIn,
        checkedOut: reservationStats.checkedOut,
        cancelled: reservationStats.cancelled
      },
      revenue: {
        daily: revenueResult.daily || 0,
        monthly: currentMonthRevenue,
        yearly: revenueResult.yearly || 0,
        trend: revenueTrend
      },
      monthlyData,
      maintenance: {
        total: maintenanceResult.total,
        daily: maintenanceResult.daily,
        monthly: maintenanceResult.monthly,
        yearly: maintenanceResult.yearly,
        assigned: maintenanceResult.assigned,
        unassigned: maintenanceResult.unassigned,
        statusBreakdown,
        perUser,
        monthlyData: monthlyMaintenanceData
      },
      feedback: {
        overall: {
          averageRating: feedbackAverageRating,
          totalReviews: feedbackTotalReviews,
          ratingBreakdown: feedbackRatingBreakdown
        },
        roomRatings: feedbackRoomRatings,
        recentReviews: feedbackRecentReviews
      }
    };

    console.log(`✅ Analytics data prepared in ${Date.now() - startTime}ms total`);

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