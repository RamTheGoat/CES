// routes/showtimes.js
import express from "express";
import Showtime from "../models/Showtime.js";

const router = express.Router();

// GET all showtimes (no filter)
router.get("/", async (req, res) => {
  try {
    const showtimes = await Showtime.find();
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET showtimes by movieId (query or param)
router.get("/:movieId", async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movieId: req.params.movieId });
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE showtime
router.post("/", async (req, res) => {
  try {
    const { movieId, movieTitle, showroom, date, time } = req.body;
    const showtime = await Showtime.findOne({ showroom, date, time });
    if (showtime) return res.status(409).json({ error: "Another movie is already showing at this room and time!" });

    const newShowtime = await Showtime.create({ movieId, movieTitle, showroom, date, time });
    res.status(200).json({ message: "Successfully added showtime", showtime: newShowtime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE showtime
router.delete("/:id", async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) return res.status(404).json({ error: "Showtime not found" });
    res.status(200).json({ message: "Successfully deleted showtime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET seat status for a showtime
router.get("/:id/seats", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    return res.json({
      heldBy: showtime.heldBy || {},
      soldSeats: Object.entries(showtime.seatMap || {})
        .filter(([_, status]) => status === "sold")
        .map(([seat]) => seat),
    });
  } catch (err) {
    console.error("Seat map error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
