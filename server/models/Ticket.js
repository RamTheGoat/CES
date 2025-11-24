import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TicketSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  booking_id: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  seat: String,
  price: Number
});

export default model("Ticket", TicketSchema);
