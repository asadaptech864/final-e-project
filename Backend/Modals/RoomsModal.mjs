import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
  roomType: {
    type: String,
    required: [true, "Room type is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
  },
  bedType: {
    type: String,
    required: [true, "Bed type is required"],
  },
  roomSize: {
    type: String,
    required: [true, "Room size is required"],
  },
  availability: {
    type: String,
    default: "Available",
  },
  status: {
    type: String,
    default: "Clean",
  },
  pricing: {
    type: Number,
    required: [true, "Pricing is required"],
    min: [0, "Pricing must be non-negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rooms = mongoose.model("Rooms", roomSchema);
export default Rooms;
