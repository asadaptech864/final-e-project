import RoomsTypes from '../Modals/RoomsType.mjs'

// Get all rooms
let getAllRoomType=async(req,res)=>{
    try {
    let roomtype = await RoomsTypes.find();
    if (roomtype.length == 0) {
           res.status(404).json({message:"No rooms found"});
    } else {
    
        res.status(200).json({
        message:"Our Rooms",
        roomtype:roomtype,
    })
    } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }   

  // Get a single room by ID
  let getRoomType=async(req,res)=>{
    try {
    
        let id= req.params.id;
    let roomtype = await Rooms.find({_id:id});
    if (room.length === 0) {
        res.status(404).json({message: "No room found"});
    } else {
        res.status(200).json({
        message:"room found",
        roomtype:roomtype,
    })
    } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }

    const RoomTypeController = {getAllRoomType, getRoomType};
    export default RoomTypeController;