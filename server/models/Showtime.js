import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ShowtimeSchema = new Schema({
  movie_id: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
  theater_id: { type: Schema.Types.ObjectId, ref: "Theater" },
  date: String,
  time: String,
  seats: [String] // optional
});

export default model("Showtime", ShowtimeSchema);
