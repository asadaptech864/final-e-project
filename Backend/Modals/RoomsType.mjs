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
    capacity: {
        type: Number,
        min: 1 
        },
    basePrice: { 
        type: Number,
        required: true 
    },
    amenities: [{ type: String }],
    images: [{ type: String }],     
});

const RoomTypes = mongoose.model("roomTypes", roomTypesSchema);
export default RoomTypes;
