import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';
import RoomTypeController from '../Controllers/RoomTypes.mjs';
import { upload } from '../cloudinaryconfig.mjs';
import UserController from '../Controllers/UsersController.mjs';
import { createReservation, getAvailableRooms, getReservationsByGuest, getAllReservations, checkInReservation, checkOutReservation, cancelReservation, getReservationByReservationId } from '../Controllers/ReservationController.mjs';
import MaintenanceController from '../Controllers/MaintenanceController.mjs';
import stripeRoutes from './stripeRoutes.mjs';
import stripeWebhook from './stripeWebhook.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
const router = express.Router();

// Register Stripe routes and webhook BEFORE any dynamic routes
router.use('/', stripeRoutes);
router.use('/', stripeWebhook);

router
//rooms routes
.get("/allrooms", RoomsController.getAllRooms)
.get("/featured", RoomsController.getFeaturedRoom)
.get("/:id", RoomsController.getRoom)
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
      res.json({ message: 'Reservation confirmed' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Error confirming reservation', error: e.message });
  }
});

export default router;