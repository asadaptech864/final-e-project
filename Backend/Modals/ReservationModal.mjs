import mongoose from "mongoose";
const { Schema } = mongoose;

const reservationSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: "Rooms", required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, required: true }, // Added guest phone
  guestId: { type: String, required: false }, // Save user id
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
  guests: { type: Number, required: true },
  additionalServices: { type: Object, default: {} }, // Save additional services as object
  createdAt: { type: Date, default: Date.now },
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation; 