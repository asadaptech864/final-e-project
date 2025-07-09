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

          // Add a new room type with image
          let addRoomTypewithimage=async(req,res)=>{
            try {
                console.log(req.file.path);
                let newRoomType = new RoomsTypes({
                 name:req.body.name,
                 description:req.body.description,
                 image:req.file.path,
                 
            
            });
            let addroomtype = await RoomsTypes.insertOne(newRoomType);
            if (!addroomtype) {
                   res.status(404).json({message:"Failed to add room type"});
            } else {
            
                res.status(200).json({
                message:"Room type added successfully",
                roomtype:addroomtype,
            })
            } 
            } catch (error) {
               console.log(error) ;
               res.status(500).json({message:"Internal server errror"});
            }
            }

// Get only 4 room types
let getFourRoomTypes = async (req, res) => {
  try {
    let roomtype = await RoomsTypes.find().limit(4);
    if (roomtype.length == 0) {
      res.status(404).json({ message: "No rooms found" });
    } else {
      res.status(200).json({
        message: "Our Rooms",
        roomtype: roomtype,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const RoomTypeController = {getAllRoomType,addRoomTypewithimage, getFourRoomTypes};
export default RoomTypeController;