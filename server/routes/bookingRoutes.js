// routes/bookingRoutes.js
import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import SeatHold from "../models/SeatHold.js";
import Showtime from "../models/Showtime.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Promotion from "../models/Promotion.js";
import Order from "../models/Order.js";

const router = express.Router();

// GET all bookings (admin view)
router.get("/bookings", async (req, res) => {
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

<<<<<<< HEAD
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
      soldSeats,
      heldBy, 
      seatMap: showtime.seatMap || {}
    });

  } catch (err) {
    console.error("Error fetching seat status:", err);
    res.status(500).json({ message: "Server error fetching seats" });
  }
});

=======
>>>>>>> parent of e5bab37 (booking colors)
// POST — HOLD seats temporarily
router.post("/hold-seats", async (req, res) => {
  try {
    const { userId, showtimeId, seats } = req.body;
    if (!userId || !showtimeId || !seats?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if any seat is already booked
    const conflict = await Booking.findOne({
      showtime_id: showtimeId,
      seats: { $in: seats },
    });
    if (conflict) return res.status(400).json({ message: "One or more seats are already booked" });

    // Create hold (expires in 5 min)
    const hold = await SeatHold.create({
      user_id: userId,
      showtime_id: showtimeId,  // Fixed: match model field name
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
router.delete("/release-hold/:holdId", async (req, res) => {
  try {
    const hold = await SeatHold.findById(req.params.holdId);
    if (!hold) return res.status(404).json({ message: "Hold not found" });

    const showtime = await Showtime.findById(hold.showtime_id);  // Fixed: use underscore
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

// POST — Confirm checkout (with promo code support)
router.post("/checkout", async (req, res) => {
  try {
    const { userId, showtimeId, holdId, seats, tickets, payment, promoCode } = req.body;

    console.log("Checkout request body:", req.body);

    // Validate required fields
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

    // Calculate total with possible discount
    let total = (tickets.adult || 0) * 12 +
                (tickets.child || 0) * 8 +
                (tickets.senior || 0) * 10;

    let discountAmount = 0;
    let appliedPromo = null;

    // Apply promo discount if provided
    if (promoCode) {
      const promo = await Promotion.findOne({ code: promoCode.toUpperCase() });
      
      if (promo) {
        const now = new Date();
        const expirationDate = new Date(promo.expiration);
        
        if (!isNaN(expirationDate.getTime()) && now <= expirationDate) {
          appliedPromo = promo;
          discountAmount = total * (promo.discount / 100);
          
          if (discountAmount > total) {
            discountAmount = total;
          }
          
          total = total - discountAmount;
        }
      }
    }

    total = Math.max(0, total);

    // Create booking with discount info
    const booking = await Booking.create({
      user_id: user._id,
      showtime_id: showtime._id,
      seats,
      total,
      discountApplied: discountAmount > 0,
      discountAmount: discountAmount,
      promoCodeUsed: appliedPromo ? appliedPromo.code : null
    });

    // Create tickets
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

    // Update seat map
    seats.forEach((seat) => {
      if (showtime.seatMap && showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "sold";
      if (showtime.heldBy) delete showtime.heldBy[seat];
    });
    await showtime.save();

    // Handle payment (simplified - you'll need proper payment processing)
    if (payment) {
      console.log("Payment processed:", payment.savedCardId ? "Saved card" : "New card");
      // Add actual payment processing here
    }

    res.status(200).json({ 
      message: "Booking confirmed", 
      bookingId: booking._id,
      total: total,
      discountApplied: discountAmount > 0
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error during checkout", error: err.message });
  }
});

// GET - Validate promo code (optional - could also be in promotionRoutes)
router.get("/promotions/validate/:code", async (req, res) => {
  try {
    const promo = await Promotion.findOne({ code: req.params.code.toUpperCase() });
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    
    const now = new Date();
    const expirationDate = new Date(promo.expiration);
    
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({ 
        message: "Invalid expiration date for promotion" 
      });
    }
    
    if (now > expirationDate) {
      return res.status(400).json({ 
        message: "This promotion has expired" 
      });
    }
    
    res.json({ 
      message: "Promo code valid", 
      promotion: {
        code: promo.code,
        discount: promo.discount,
        expiration: promo.expiration,
        message: promo.message
      }
    });
  } catch (err) {
    console.error("Promo validation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// REMOVE the setInterval from here - move to server.js
// setInterval(async () => { ... }, 60 * 1000);

export default router;