import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    showtime_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Showtime"
    },
    seats: [String],
    bookingDate: Date,
    totalAmount: Number
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;