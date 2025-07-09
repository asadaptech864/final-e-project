import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
  name: {
    type: String,
    required: [true, "Room Name is required"],
  },
  rate: {
    type: String,
    required: [true, "rate is required"],
  },
  beds: {
    type: Number,
    required: [true, "Beds is required"],
  },
  baths: {
    type: Number,
    required: [true, "Baths is required"],
  },
  area: {
    type: Number,
    required: [true, "area is required"],
  },
  availability: {
    type: String,
    default: "Available",
  },
  status: {
    type: String,
    default: "Clean",
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
  },
  images: {
    type: [String], 
    required: [true, "Image is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rooms = mongoose.model("Rooms", roomSchema);
export default Rooms;
