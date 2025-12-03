// routes/movies.js
import express from "express";
import Movie from "../models/Movie.js";

const router = express.Router();

// GET /api/movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/movies/:id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/movies
router.post("/", async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    if (!newMovie) throw new Error("Failed to create the movie");
    else res.status(200).json({ message: "Successfully added movie", movie: newMovie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/movies/:id
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json({ message: "Successfully deleted movie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
