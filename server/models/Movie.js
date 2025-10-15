import mongoose from "mongoose";

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: String,
    genre: [String],
    cast: [String],
    producers: [String],
    director: String,
    filmRating: String,
    synopsis: String,
    reviews: [String],
    trailerUrl: String,
    posterUrl: String,
    bannerImage: { type: String, default: "" },
    galleryImages: { type: [String], default: [] }
}, { collection: "Movie Details"});

const Movie = mongoose.model("Movies", movieSchema);
export default Movie;