import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SeatHoldSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  showtime_id: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [String],
  expiresAt: { type: Date, required: true }
});

export default model("SeatHold", SeatHoldSchema);