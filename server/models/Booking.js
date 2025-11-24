import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BookingSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  showtime_id: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [String],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

export default model("Booking", BookingSchema);
