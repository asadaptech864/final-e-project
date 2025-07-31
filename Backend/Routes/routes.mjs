import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';
import RoomTypeController from '../Controllers/RoomTypes.mjs';
import { upload } from '../cloudinaryconfig.mjs';
import UserController from '../Controllers/UsersController.mjs';
import { createReservation, getAvailableRooms, getReservationsByGuest, getAllReservations, checkInReservation, checkOutReservation, cancelReservation, getReservationByReservationId, sendReservationConfirmationEmail, getReservationById, testDateFiltering } from '../Controllers/ReservationController.mjs';
import MaintenanceController from '../Controllers/MaintenanceController.mjs';
import stripeRoutes from './stripeRoutes.mjs';
import stripeWebhook from './stripeWebhook.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
import { getUserNotifications, markNotificationRead, getUsersByRole, sendNotificationToUser } from '../Controllers/UsersController.mjs';
import Notification from '../Modals/NotificationModal.mjs';
import AnalyticsController from '../Controllers/AnalyticsController.mjs';
import SettingsController from '../Controllers/SettingsController.mjs';
import { submitFeedback, cleanupFeedbackDatabase, getRoomFeedback, checkFeedbackExists, getAllFeedback, getUserFeedback, deleteFeedback } from '../Controllers/FeedbackController.mjs';
import { createContact, getAllContacts, sendAdminReply, getContactById, updateContactStatus } from '../Controllers/ContactController.mjs';
const router = express.Router();

// Register Stripe routes and webhook BEFORE any dynamic routes
router.use('/', stripeRoutes);
router.use('/', stripeWebhook);

// Analytics routes
router.get('/analytics', AnalyticsController.getAnalytics);
router.get('/test-reservations', AnalyticsController.testReservations);

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
.put("/users/:id", UserController.updateUserProfile)
.get("/users/:id", UserController.getUserById)
.get('/maintenance/users', UserController.getAllMaintenanceUsers)
// Forgot password routes
.post("/auth/forgot-password", UserController.forgotPassword)
.post("/auth/validate-reset-token", UserController.validateResetToken)
.post("/auth/reset-password", UserController.resetPassword)
// Google signup route
.post("/auth/google-signup", UserController.googleSignup)
//maintenance routes
.get("/allRequestedMaintenance/all", MaintenanceController.getAllMaintenanceRequests)
.patch('/maintenance/requests/:id/assign', MaintenanceController.assignMaintenanceRequest)
.patch('/maintenance/requests/:id/status', MaintenanceController.updateMaintenanceStatus)
.post('/maintenance/requests', MaintenanceController.createMaintenanceRequest);

//Feedback routes
router.post('/feedback', submitFeedback);
router.get('/feedback/room/:roomId', getRoomFeedback);
router.get('/feedback/check/:reservationId', checkFeedbackExists);
router.get('/feedback/all', getAllFeedback);
router.get('/feedback/user/:userId', getUserFeedback);
router.delete('/feedback/:feedbackId', deleteFeedback);
router.post('/feedback/cleanup', cleanupFeedbackDatabase);

//Contact routes
router.post('/contact', createContact);
router.get('/contact/all', getAllContacts);
router.get('/contact/:contactId', getContactById);
router.post('/contact/:contactId/reply', sendAdminReply);
router.patch('/contact/:contactId/status', updateContactStatus);

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
router.get('/test-date-filtering', testDateFiltering);
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

// Upload endpoint for profile pictures
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl: req.file.path 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router;