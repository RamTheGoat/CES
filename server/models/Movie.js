import mongoose from "mongoose";

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: String,
    genre: [String],
    cast: [String],
    producer: [String],
    director: [String],
    filmRating: String,
    synopsis: String,
    review: {
        IMDb: String,
        RottenTomatoes: String,
        Letterboxd: String
    },
    trailerUrl: String,
    posterUrl: String,
    status: String,
    bannerImage: { type: String, default: "" },
    galleryImages: { type: [String], default: [] }
});

export default mongoose.model("Movie", movieSchema, "movies");