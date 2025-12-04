// routes/showtimes.js
import express from "express";
import Showtime from "../models/Showtime.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// GET all showtimes (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { movieId, showroom, date } = req.query;
    let query = {};
    
    // Add filters if provided
    if (movieId) query.movieId = movieId;
    if (showroom) query.showroom = showroom;
    if (date) query.date = date;
    
    const showtimes = await Showtime.find(query)
      .populate("showroom", "name location screenNumber") // Populate showroom info
      .sort({ date: 1, time: 1 });
    
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET showtimes by movieId with optional showroom filter
router.get("/movie/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const { showroom } = req.query; // Optional showroom filter
    
    let query = { movieId };
    
    // Add showroom filter if provided
    if (showroom) {
      query.showroom = showroom;
    }
    
    const showtimes = await Showtime.find(query)
      .populate("showroom", "name location screenNumber") // Populate showroom info
      .sort({ date: 1, time: 1 });
    
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific showtime by ID
router.get("/:id", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("showroom", "name location screenNumber"); // Populate showroom info
    
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    
    res.status(200).json(showtime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE showtime
router.post("/", async (req, res) => {
  try {
    const { movieId, movieTitle, showroom, date, time } = req.body;
    
    // Check for time slot conflict
    const showtime = await Showtime.findOne({ showroom, date, time });
    if (showtime) {
      return res.status(409).json({ 
        error: "Another movie is already showing at this room and time!" 
      });
    }

    const newShowtime = await Showtime.create({ 
      movieId, 
      movieTitle, 
      showroom, 
      date, 
      time 
    });
    
    res.status(200).json({ 
      message: "Successfully added showtime", 
      showtime: newShowtime 
    });
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

    const bookings = await Booking.find({ showtime_id: req.params.id });
    const seats = bookings.flatMap(booking => booking.seats);

    return res.json({
      heldBy: showtime.heldBy || {},
      // soldSeats: Object.entries(showtime.seatMap || {})
      //   .filter(([_, status]) => status === "sold")
      //   .map(([seat]) => seat),
      soldSeats: seats,
    });
  } catch (err) {
    console.error("Seat map error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;