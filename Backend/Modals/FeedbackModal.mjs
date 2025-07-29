import mongoose from "mongoose";
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  reservationId: {
    type: String,
    required: [true, "Reservation ID is required"],
    unique: true, // Ensure one feedback per reservation
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rooms',
    required: [true, "Room ID is required"],
  },
  guestId: {
    type: String, // Changed to String to match the session user ID format
    required: [true, "Guest ID is required"],
  },
  guestName: {
    type: String,
    required: [true, "Guest name is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
    maxlength: 500,
  },
  cleanliness: {
    type: Number,
    required: [true, "Cleanliness rating is required"],
    min: 1,
    max: 5,
  },
  comfort: {
    type: Number,
    required: [true, "Comfort rating is required"],
    min: 1,
    max: 5,
  },
  service: {
    type: Number,
    required: [true, "Service rating is required"],
    min: 1,
    max: 5,
  },
  value: {
    type: Number,
    required: [true, "Value rating is required"],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to clean up any problematic data
feedbackSchema.pre('save', function(next) {
  // Ensure all required fields are present
  if (!this.reservationId || !this.guestId || !this.guestName) {
    return next(new Error('Missing required fields'));
  }
  
  // Ensure guestId is a string
  this.guestId = this.guestId.toString();
  
  next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;