import mongoose from "mongoose";
const { Schema } = mongoose;

const roomTypesSchema = new Schema({
    name: {
         type: String,
          required: true,
          unique: true
         },
    description: { 
        type: String
     },
    image: {
         type: String,
         required: true
         },     
});

const RoomTypes = mongoose.model("roomTypes", roomTypesSchema);
export default RoomTypes;
