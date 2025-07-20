import RoomsTypes from '../Modals/RoomsType.mjs'

// Get all room types
let getAllRoomType = async(req,res)=>{
  try {
  let roomtype = await RoomsTypes.find();
  if (roomtype.length == 0) {
         res.status(404).json({message:"No room type found"});
  } else {
  
      res.status(200).json({
      message:"Our Room Types",
      roomtype: roomtype,
  })
  } 
  } catch (error) {
     console.log(error) ;
     res.status(500).json({message:"Internal server error"});
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
  let addroomtype = await newRoomType.save();
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
     res.status(500).json({message:"Internal server error"});
  }
  }

// Update a room type
let updateRoomType = async(req,res)=>{
  try {
      let id=req.params.id;
      let updateData = { ...req.body };
      
      // Handle file upload if new image is provided
      if (req.file) {
          updateData.image = req.file.path;
      }
      
      let updateRoomType=await RoomsTypes.findByIdAndUpdate(id, updateData, {new:true});
      if(!updateRoomType){
          res.status(404).json({message:"Room type not found"});
      }else{
          res.status(200).json({message:"Room type updated successfully",roomtype:updateRoomType});
      }
  } catch (error) {
      console.log(error);
      res.status(500).json({message:"Internal server error"});
  }
}

// Delete a room type
let deleteRoomType = async(req,res)=>{
  try {
      let id=req.params.id;
      let deleteRoomType=await RoomsTypes.findByIdAndDelete(id);
      if(!deleteRoomType){
          res.status(404).json({message:"Room type not found"});
      }else{
          res.status(200).json({message:"Room type deleted successfully"});
      }
      
  } catch (error) {
      console.log(error);
      res.status(500).json({message:"Internal server error"});
  }
}

// Get only 4 room types
let getFourRoomTypes = async (req, res) => {
  try {
    let roomtype = await RoomsTypes.find().limit(4);
    if (roomtype.length == 0) {
      res.status(404).json({ message: "No room types found" });
    } else {
      res.status(200).json({
        message: "Our Room Types",
        roomtype: roomtype,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const RoomTypeController = {getAllRoomType, addRoomTypewithimage, updateRoomType, deleteRoomType, getFourRoomTypes};
export default RoomTypeController;