import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';
import RoomTypeController from '../Controllers/RoomTypes.mjs';
import { upload } from '../cloudinaryconfig.mjs';
import UserController from '../Controllers/UsersController.mjs';
import { createReservation, getAvailableRooms, getReservationsByGuest, getAllReservations, checkInReservation, checkOutReservation, cancelReservation, getReservationByReservationId, sendReservationConfirmationEmail, getReservationById } from '../Controllers/ReservationController.mjs';
import MaintenanceController from '../Controllers/MaintenanceController.mjs';
import stripeRoutes from './stripeRoutes.mjs';
import stripeWebhook from './stripeWebhook.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
import { getUserNotifications, markNotificationRead, getUsersByRole, sendNotificationToUser } from '../Controllers/UsersController.mjs';
import Notification from '../Modals/NotificationModal.mjs';
import AnalyticsController from '../Controllers/AnalyticsController.mjs';
import SettingsController from '../Controllers/SettingsController.mjs';
const router = express.Router();

// Register Stripe routes and webhook BEFORE any dynamic routes
router.use('/', stripeRoutes);
router.use('/', stripeWebhook);

// Analytics route
router.get('/analytics', AnalyticsController.getAnalytics);

// Settings routes
router.get('/admin/settings', SettingsController.getSettings);
router.put('/admin/settings/:section', SettingsController.updateSettings);
router.get('/admin/settings/:section', SettingsController.getSettingsSection);

router
//rooms routes
.get("/allrooms", RoomsController.getAllRooms)
.get("/featured", RoomsController.getFeaturedRoom)
.get("/rooms/:id", RoomsController.getRoom)
.post("/addroom",upload.array('images', 5), RoomsController.addRoom)
.delete("/delete/:id", RoomsController.deleteRoom)
.put("/update/:id", upload.array('images', 5), RoomsController.updateRoom)
.patch("/rooms/update-status/:id", RoomsController.updateRoomStatus)
//rooms type routes
.post("/addroomtype", upload.single('image'), RoomTypeController.addRoomTypewithimage)
.put("/updateroomtype/:id", upload.single('image'), RoomTypeController.updateRoomType)
.delete("/deleteroomtype/:id", RoomTypeController.deleteRoomType)
.get("/roomtypes/limited", RoomTypeController.getFourRoomTypes)
.get("/roomtypes/allroomtype", RoomTypeController.getAllRoomType)
//users routes
.post("/signup/adduser", UserController.addUser)
.post("/signin/login", UserController.LoginUser)
.get("/users/allusers", UserController.getAllUsers)
.delete("/deleteuser/:id", UserController.deleteuser)
.patch("/deactivate/:id", UserController.deactivateAndActivateUser)
.patch("/activate/:id", UserController.deactivateAndActivateUser)
.patch("/edituser/:id", UserController.editUser)
.get("/users/:id", UserController.getUserById)
.get('/maintenance/users', UserController.getAllMaintenanceUsers)
//maintenance routes
.get("/allRequestedMaintenance/all", MaintenanceController.getAllMaintenanceRequests)
.patch('/maintenance/requests/:id/assign', MaintenanceController.assignMaintenanceRequest)
.patch('/maintenance/requests/:id/status', MaintenanceController.updateMaintenanceStatus)
.post('/maintenance/requests', MaintenanceController.createMaintenanceRequest);

// Reservation routes
router.post('/reservations', createReservation);
router.get('/reservations/available', getAvailableRooms);
router.get('/reservations/guest/:guestId', getReservationsByGuest);
router.get('/reservations/all', getAllReservations);
router.get('/reservations/by-id/:id', getReservationById);
router.patch('/reservations/:id/checkin', checkInReservation);
router.patch('/reservations/:id/checkout', checkOutReservation);
router.patch('/reservations/:id/cancel', cancelReservation);
router.get('/reservations/:reservationId', getReservationByReservationId);
router.post('/reservations/confirm', async (req, res) => {
  const { reservationId } = req.body;
  if (!reservationId) return res.status(400).json({ message: 'reservationId required' });
  try {
    const result = await Reservation.findOneAndUpdate(
      { reservationId },
      { status: 'Confirmed' }
    );
    if (result) {
      // Create notification for reservation confirmation
      try {
        await Notification.create({
          userId: result.guestId,
          type: 'reservation',
          message: `Reservation ${reservationId} confirmed! Payment successful.`,
          data: { 
            reservationId, 
            status: 'Confirmed',
            roomId: result.room,
            checkin: result.checkin,
            checkout: result.checkout,
            price: result.price
          },
        });
      } catch (e) {
        console.error('Notification creation error:', e);
      }
      
      res.json({ message: 'Reservation confirmed' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Error confirming reservation', error: e.message });
  }
});
// New: Send confirmation email after payment (for guests)
router.post('/reservations/send-confirmation-email', sendReservationConfirmationEmail);
router.get('/notifications/:userId', getUserNotifications);
router.patch('/notifications/read/:notificationId', markNotificationRead);
router.get('/users/role/:role', getUsersByRole);
router.post('/notifications/send', sendNotificationToUser);

export default router;