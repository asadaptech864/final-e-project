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
  status: { type: String, default: 'Pending' }, // Reservation status: Confirmed, Checked In, Checked Out, Cancelled
  additionalServices: { type: Object, default: {} }, // Save additional services as object
  cancelledBy: {
    userId: { type: String },
    name: { type: String },
    role: { type: String }
  },
  reservationId: { type: String, required: true, unique: true }, // Unique reservation ID
  price: { type: Number, required: false }, // Total price for the reservation
  createdAt: { type: Date, default: Date.now },
  actualCheckout: { type: Date }, // Actual checkout date
  bill: { type: Object }, // Bill breakdown
  invoiceHtml: { type: String }, // Invoice HTML for download/email
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation; 