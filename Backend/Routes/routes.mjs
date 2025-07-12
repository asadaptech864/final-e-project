import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';
import RoomTypeController from '../Controllers/RoomTypes.mjs';
import { upload } from '../cloudinaryconfig.mjs';
const router = express.Router();


router
.get("/allrooms", RoomsController.getAllRooms)
.get("/:id", RoomsController.getRoom)
.post("/addroom",upload.array('images', 5), RoomsController.addRoom)
.delete("/delete/:id", RoomsController.deleteRoom)
.put("/update/:id", RoomsController.updateRoom)
.post("/addroomtype", upload.single('image'), RoomTypeController.addRoomTypewithimage)
.get("/roomtypes/limited", RoomTypeController.getFourRoomTypes)


export default router;