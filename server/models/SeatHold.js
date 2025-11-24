import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SeatHoldSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  showtimeId: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [String], 
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Optional TTL Index
// SeatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("SeatHold", SeatHoldSchema);
