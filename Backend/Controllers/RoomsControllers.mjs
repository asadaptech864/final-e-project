import Rooms from '../Modals/RoomsModal.mjs'
import mongoose from 'mongoose';

// Get all rooms
let getAllRooms=async(req,res)=>{
    try {
    let rooms = await Rooms.find();
    if (rooms.length == 0) {
           res.status(404).json({message:"No rooms found"});
    } else {
    
        res.status(200).json({
        message:"Our Rooms",
        rooms:rooms,
    })
    } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }

// Get featured room (first room or specific room)
let getFeaturedRoom=async(req,res)=>{
    try {
    let featuredRoom = await Rooms.findOne().sort({createdAt: -1}); // Get latest room
    if (!featuredRoom) {
           res.status(404).json({message:"No featured room found"});
    } else {
    
        res.status(200).json({
        message:"Featured Room",
        room:featuredRoom,
    })
    } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }   

  // Get a single room by ID
  let getRoom=async(req,res)=>{
    try {
        let id= req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid room ID" });
        }
        let room = await Rooms.find({_id:id});
        if (room.length === 0) {
            res.status(404).json({message: "No room found"});
        } else {
            res.status(200).json({
            message:"room found",
            room:room,
        })
        } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }

// Add a new room
let addRoom=async(req,res)=>{
    const imagePaths = req.files.map(file => file.path);
            try {
            let newRoom = new Rooms({
                 name:req.body.name,
                 description:req.body.description,
                 roomType:req.body.roomType,
                 beds:req.body.beds,
                 baths:req.body.baths,
                 area:req.body.area,
                 capacity:req.body.capacity,
                 images: imagePaths, // Store array of image URLs
                 
            
            });
            let addroom = await newRoom.save();
            if (!addroom) {
                   res.status(404).json({message:"Failed to add room"});
            } else {
            
                res.status(200).json({
                message:"Room added successfully",
                room:addroom,
            })
            } 
            } catch (error) {
               console.log(error) ;
               res.status(500).json({message:"Internal server errror"});
            }
            }
            
             // Update a room
             let updateRoom=async(req,res)=>{
                try {
                    let id=req.params.id;
                    let updateData = { ...req.body };
                    
                    // Handle file uploads if new images are provided
                    if (req.files && req.files.length > 0) {
                        const imagePaths = req.files.map(file => file.path);
                        updateData.images = imagePaths;
                    }
                    
                    let updateRoom=await Rooms.findByIdAndUpdate(id, updateData, {new:true});
                    if(!updateRoom){
                        res.status(404).json({message:"Room not found"});
                    }else{
                        res.status(200).json({message:"Room updated successfully",room:updateRoom});
                    }
                } catch (error) {
                    console.log(error);
                    res.status(500).json({message:"Internal server error"});
                }
            }
              // Delete a room
              let deleteRoom=async(req,res)=>{
                try {
                    let id=req.params.id;
                    let deleteRoom=await Rooms.findByIdAndDelete(id);
                    if(!deleteRoom){
                        res.status(404).json({message:"Room not found"});
                    }else{
                        res.status(200).json({message:"Room deleted successfully"});
                    }
                    
                } catch (error) {
                    console.log(error);
                    res.status(500).json({message:"Internal server error"});
                }
            }
            //update room status
            let updateRoomStatus=async(req,res)=>{
                try {
                    let id=req.params.id;
                    let updateRoom=await Rooms.findByIdAndUpdate(id, req.body, {new:true});
                    if(!updateRoom){
                        res.status(404).json({message:"Room not found"});
                    }else{
                        res.status(200).json({message:"Room status updated successfully",room:updateRoom});
                    }
                } catch (error) {
                    console.log(error);
                    res.status(500).json({message:"Internal server error"});
                }
            }
    const RoomsController = {addRoom,getAllRooms,getRoom,deleteRoom,updateRoom,getFeaturedRoom,updateRoomStatus};
    export default RoomsController;