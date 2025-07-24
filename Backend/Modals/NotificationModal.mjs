import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  type: { type: String, required: true }, // e.g. 'maintenance', 'reservation', etc.
  message: { type: String, required: true },
  data: { type: Object }, // Any extra data (reservationId, etc.)
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification; 