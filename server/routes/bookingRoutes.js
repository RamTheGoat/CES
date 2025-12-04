// routes/bookings.js
import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import SeatHold from "../models/SeatHold.js";
import Showtime from "../models/Showtime.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

// GET all bookings (kept the populate logic)
router.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user_id", "firstName lastName email")
      .populate({
        path: "showtime_id",
        populate: [
          { path: "movie_id", select: "title genre duration" },
          { path: "theater_id", select: "name location" },
        ],
      });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adding Seat Status
router.get("/api/showtimes/:showtimeId/seats", async (req, res) => {
  try {
    // Find the showtime
    const showtime = await Showtime.findById(req.params.showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Find all bookings for this showtime to get sold seats
    const bookings = await Booking.find({ showtime_id: req.params.showtimeId });
    const soldSeats = bookings.flatMap(booking => booking.seats);

    // Find all active seat holds (not expired yet)
    const holds = await SeatHold.find({ 
      showtime_id: req.params.showtimeId,
      expiresAt: { $gt: new Date() } // Only get holds that haven't expired
    });

    // Create object showing who holds each seat
    const heldBy = {};
    holds.forEach(hold => {
      hold.seats.forEach(seat => {
        heldBy[seat] = hold.user_id;
      });
    });

    // Send back the seat data
    res.json({
      soldSeats,      // Array of sold seats like ["A1", "B2"]
      heldBy,         // Object like {"C3": "user123", "C4": "user123"}
      seatMap: showtime.seatMap || {} // Include any existing seat map
    });

  } catch (err) {
    console.error("Error fetching seat status:", err);
    res.status(500).json({ message: "Server error fetching seats" });
  }
});

// POST — HOLD seats temporarily
router.post("/api/hold-seats", async (req, res) => {
  try {
    const { userId, showtimeId, seats } = req.body;
    if (!userId || !showtimeId || !seats?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if any seat is already booked
    const BookingModel = mongoose.model("Booking");
    const conflict = await BookingModel.findOne({
      showtime_id: showtimeId,
      seats: { $in: seats },
    });
    if (conflict) return res.status(400).json({ message: "One or more seats are already booked" });

    // Create hold (expires in 5 min)
    const hold = await SeatHold.create({
      user_id: userId,
      showtime_id: showtimeId,
      seats,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    res.json({ holdId: hold._id, expiresAt: hold.expiresAt });
  } catch (err) {
    console.error("Error holding seats:", err);
    res.status(500).json({ message: "Server error holding seats" });
  }
});

// DELETE — RELEASE an expired or cancelled hold
router.delete("/api/release-hold/:holdId", async (req, res) => {
  try {
    const hold = await SeatHold.findById(req.params.holdId);
    if (!hold) return res.status(404).json({ message: "Hold not found" });

    const showtime = await Showtime.findById(hold.showtimeId);
    if (showtime) {
      hold.seats.forEach(seat => {
        if (showtime.seatMap && showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "available";
        if (showtime.heldBy) delete showtime.heldBy[seat];
      });
      await showtime.save();
    }

    await SeatHold.findByIdAndDelete(hold._id);
    res.json({ message: "Seat hold released" });
  } catch (err) {
    console.error("Release error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// AUTO-EXPIRE HOLDS every 60 seconds
setInterval(async () => {
  try {
    const now = Date.now();
    const expiredHolds = await SeatHold.find({ expiresAt: { $lt: now } });

    for (let hold of expiredHolds) {
      const showtime = await Showtime.findById(hold.showtimeId);

      if (!showtime) {
        console.warn(`Showtime not found for hold ${hold._id} (ID: ${hold.showtimeId})`);
        await SeatHold.findByIdAndDelete(hold._id);
        continue;
      }

      hold.seats.forEach(seat => {
        if (showtime.seatMap && showtime.seatMap[seat] === "held") {
          showtime.seatMap[seat] = "available";
        }
        if (showtime.heldBy) delete showtime.heldBy[seat];
      });

      await showtime.save();
      await SeatHold.findByIdAndDelete(hold._id);
    }
  } catch (err) {
    console.error("Auto-expire error:", err);
  }
}, 60 * 1000);

// POST — Confirm checkout
router.post("/api/checkout", async (req, res) => {
  try {
    const { userId, showtimeId, holdId, seats, tickets } = req.body;

    console.log("Checkout request body:", req.body); // Debug logging

    if (!userId || !showtimeId || !holdId || !seats?.length || !tickets) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hold = await SeatHold.findById(holdId);
    if (!hold || hold.expiresAt < new Date()) {
      return res.status(400).json({ message: "Hold not found or expired" });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    const total =
      (tickets.adult || 0) * 12 +
      (tickets.child || 0) * 8 +
      (tickets.senior || 0) * 10;

    const booking = await Booking.create({
      user_id: user._id,
      showtime_id: showtime._id,
      seats,
      total,
    });

    const ticketDocs = [];
    let seatIndex = 0;

    for (let i = 0; i < (tickets.adult || 0); i++) {
      ticketDocs.push({
        user_id: user._id,
        booking_id: booking._id,
        seat: seats[seatIndex++],
        price: 12,
      });
    }

    for (let i = 0; i < (tickets.child || 0); i++) {
      ticketDocs.push({
        user_id: user._id,
        booking_id: booking._id,
        seat: seats[seatIndex++],
        price: 8,
      });
    }

    for (let i = 0; i < (tickets.senior || 0); i++) {
      ticketDocs.push({
        user_id: user._id,
        booking_id: booking._id,
        seat: seats[seatIndex++],
        price: 10,
      });
    }

    await Ticket.insertMany(ticketDocs);
    await SeatHold.findByIdAndDelete(holdId);

    seats.forEach((seat) => {
      if (showtime.seatMap && showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "sold";
      if (showtime.heldBy) delete showtime.heldBy[seat];
    });
    await showtime.save();

    res.status(200).json({ message: "Booking confirmed", bookingId: booking._id });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error during checkout", error: err });
  }
});

export default router;
