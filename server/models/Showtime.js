import mongoose from "mongoose";

const ShowtimeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },

  movieTitle: {
    type: String,
    required: true,
  },

  date: {
    type: String, 
    required: true,
  },

  time: {
    type: String, 
    required: true,
  },

  // seatMap stores: seatNumber "available" | "held" | "sold"
  seatMap: {
    type: Object,
    required: true,
    default: {} // Filled when showtime is created
  },

  // Store which user is holding which seat
  heldBy: {
    type: Object,   
    default: {}
  },

}, { timestamps: true });

export default mongoose.model("Showtime", ShowtimeSchema);
