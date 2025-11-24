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

  seatMap: {
    type: Map,
    of: String, // "held" | "sold"
    default: {},
  },

  heldBy: {
    type: Map,
    of: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: {},
  },
}, { timestamps: true });

export default mongoose.model("Showtime", ShowtimeSchema);
