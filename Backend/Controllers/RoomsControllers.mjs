import Rooms from '../Modals/RoomsModal.mjs'

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

  // Get a single room by ID
  let getRoom=async(req,res)=>{
    try {
    
        let id= req.params.id;
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
                 rate:req.body.rate,
                 beds:req.body.beds,
                 baths:req.body.baths,
                 area:req.body.area,
                 availability:req.body.availability,
                 status:req.body.status,
                 capacity:req.body.capacity,
                 images: imagePaths, // Store array of image URLs
                 
            
            });
            let addroom = await Rooms.insertOne(newRoom);
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
                    let updateRoom=await Rooms.findByIdAndUpdate(id,req.body,{new:true});
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

    const RoomsController = {addRoom,getAllRooms,getRoom,deleteRoom,updateRoom};
    export default RoomsController;