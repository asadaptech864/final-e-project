import express from 'express'; 
import RoomsController from '../Controllers/RoomsControllers.mjs';

const router = express.Router();


router
.get("/", RoomsController.getAllRooms)
.get("/:id", RoomsController.getRoom)
.post("/addroom", RoomsController.addRoom)
.delete("/delete/:id", RoomsController.deleteRoom)



export default router;