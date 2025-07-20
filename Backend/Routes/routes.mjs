import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';
import RoomTypeController from '../Controllers/RoomTypes.mjs';
import { upload } from '../cloudinaryconfig.mjs';
import UserController from '../Controllers/UsersController.mjs';
const router = express.Router();


router
//rooms routes
.get("/allrooms", RoomsController.getAllRooms)
.get("/featured", RoomsController.getFeaturedRoom)
.get("/:id", RoomsController.getRoom)
.post("/addroom",upload.array('images', 5), RoomsController.addRoom)
.delete("/delete/:id", RoomsController.deleteRoom)
.put("/update/:id", upload.array('images', 5), RoomsController.updateRoom)
//rooms type routes
.post("/addroomtype", upload.single('image'), RoomTypeController.addRoomTypewithimage)
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

export default router;