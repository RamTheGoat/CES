import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import nodemailer from "nodemailer";
import Movie from "./models/Movie.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";
import Promotion from "./models/Promotion.js";
import Ticket from "./models/Ticket.js";
import Showtime from "./models/Showtime.js";
import Showroom from "./models/Showroom.js"
import SeatHold from "./models/SeatHold.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendProfileUpdateEmail, sendPromotionalEmail } from "./mailer.js";
const JWT_SECRET = "secret"; 

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://rampatel4204:Patel4204@ces.yybxumv.mongodb.net/Movies", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Helper to generate random temporary password
function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}

// ------------------------- MOVIES & BOOKINGS -------------------------
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json({ message: "Successfully deleted movie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/movies", async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    if (!newMovie) throw new Error("Failed to create the movie");
    else res.status(200).json({ message: "Successfully added movie", movie: newMovie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/bookings", async (req, res) => {
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

// ------------------------- REGISTER -------------------------
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, agreeToTerms, acceptPromos } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      address: "",
      isActive: false,
      verificationToken,
      promotion: acceptPromos,
    });

    await newUser.save();

    // ✅ Use localhost for testing
    const verifyUrl = `http://localhost:4000/verify/${verificationToken}`;

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",
        pass: "wpyhctrfiwlroqea",
      },
    });

    await transporter.sendMail({
      from: '"E-Cinema" <Jiexian0902@gmail.com>',
      to: email,
      subject: "Verify Your E-Cinema Account",
      html: `
        <h2>Hello, ${firstName}</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
      `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// handle verfication 
app.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user)
      return res
        .status(400)
        .send("<h3>Invalid or expired verification link.</h3>");

    user.isActive = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("<h3>Your account has been verified successfully! You can now log in.</h3>");
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).send("<h3>Server error. Please try again later.</h3>");
  }
});

// ------------------------- FORGOT PASSWORD -------------------------
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate temporary password
    const tempPassword = generateTempPassword(12);
    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    // Save temporary password and flags
    user.password = hashedTemp;
    user.mustChangePassword = true;
    user.tempPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",
        pass: "wpyhctrfiwlroqea",
      },
    });

    const emailHtml = `
      <h2>Hello ${user.firstName || ""}</h2>
      <p>You requested a password reset. A temporary password has been generated:</p>
      <p style="font-weight:bold; font-size:16px; padding:8px; border:1px solid #ddd; display:inline-block;">${tempPassword}</p>
      <p>This temporary password expires in 1 hour. Please log in and change your password immediately.</p>
    `;

    await transporter.sendMail({
      from: '"E-Cinema" <Jiexian0902@gmail.com>',
      to: email,
      subject: "E-Cinema — Temporary Password",
      html: emailHtml,
    });

    res.status(200).json({ message: "Temporary password emailed. Check your inbox." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------- LOGIN -------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🚫 Block unverified users
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is not verified. Please check your email for the verification link.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check if using a temporary password
    if (user.mustChangePassword) {
      if (user.tempPasswordExpires && user.tempPasswordExpires < Date.now()) {
        return res
          .status(401)
          .json({ message: "Temporary password expired. Request a new one." });
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          mustChangePassword: true,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message:
          "Login successful — temporary password in use. Change required.",
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          role: user.role,
        },
        mustChangePassword: true,
      });
    }

    // ✅ Normal verified user login
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        role: user.role,
      },
      mustChangePassword: false,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET all user profiles
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user profile
app.get("/api/users/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });
    return res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit user profile
app.put("/api/users/edit/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    let changes = {};
    for (let prop in profile.toObject()) {
      if (req.body[prop] != null && req.body[prop] !== profile[prop]) {
        changes[prop] = req.body[prop];
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: "No changes were made to the user profile" });
    }

    await User.updateOne({ _id: profile._id }, { $set: changes });

    if (!req.body.dontSendProfileUpdateEmail) {
      await sendProfileUpdateEmail(profile.email, profile.firstName, "profile information");
    }

    return res.status(200).json({ message: "Edit user profile was successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// PUT edit user password
app.put("/api/users/password/edit/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    const isPasswordValid = await bcrypt.compare(req.body.current, profile.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Current password is invalid" });

    let filter = { _id: profile._id };
    let changes = { password: await bcrypt.hash(req.body.new, 10) };
    const result = await User.updateOne(filter, { $set: changes });

    if (result.modifiedCount > 0) {
      // ✅ Send password change email
      await sendProfileUpdateEmail(profile.email, profile.firstName, "password");
      return res.status(200).json({ message: "Edit user password was successful" });
    }

    return res.status(200).json({ message: "No changes were made to the user password" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------- PAYMENT CARD -------------------------
// PUT edit user payment card
app.put("/api/users/card/edit/:cardId", async (req, res) => {
  try {
    const profile = await User.findOne({ "paymentCards._id": req.params.cardId });
    if (!profile) return res.status(404).json({ error: "Payment card not found" });
    const card = await profile.paymentCards.find(c => c._id.equals(req.params.cardId));
    if (!card) return res.status(404).json({ error: "Payment card not found" });

    let changes = {};
    for (let prop in card.toObject()) {
      if (req.body[prop] != null) changes[`paymentCards.$.${prop}`] = req.body[prop];
    }

    // Update the payment card with the card id
    let filter = { 'paymentCards._id': card._id };
    const result = await User.updateOne(filter, { $set: changes });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT remove user payment card
app.put("/api/users/card/remove/:cardId", async (req, res) => {
  try {
    const profile = await User.findOne({ "paymentCards._id": req.params.cardId });
    if (!profile) return res.status(404).json({ error: "Payment card not found" });
    const card = await profile.paymentCards.find(c => c._id.equals(req.params.cardId));
    if (!card) return res.status(404).json({ error: "Payment card not found" });

    // Remove the payment card with the card id
    let filter = { 'paymentCards._id': card._id };
    const result = await User.updateOne(filter, { $pull: { paymentCards: { _id: card._id } } });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Remove payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add user payment card
app.post("/api/users/card/add/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    if (profile.paymentCards.length >= 4) {
      return res.status(409).json({ error: "Cannot add more than 4 payment cards" });
    }

    // Create a new payment card
    let newCard = {};
    if (req.body.cardType && req.body.cardNumber && req.body.expirationMonth && req.body.expirationYear) {
      newCard.cardType = req.body.cardType;
      newCard.cardNumber = await bcrypt.hash(req.body.cardNumber, 10);
      newCard.lastFour = req.body.cardNumber.slice(-4);
      newCard.expirationMonth = req.body.expirationMonth;
      newCard.expirationYear = req.body.expirationYear;
    } else {
      return res.status(422).json({ error: "Add payment card information is incomplete" });
    }

    // Add the payment card to the user with the user id
    let filter = { '_id': profile._id };
    const result = await User.updateOne(filter, { $push: { paymentCards: { $each: [newCard], $position: 0 }}});

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Add payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------- PROMOTION -------------------------

app.get("/api/promotions", async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.status(200).json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/promotions", async (req, res) => {
  try {
    const newPromo = await Promotion.create(req.body);
    if (!newPromo) throw new Error("Failed to create the promotion");
    else res.status(200).json({ message: "Successfully added promotion", promotion: newPromo });
  } catch (error) {
    console.error("Add promotion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/promotions/:promoId", async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.promoId);
    if (!promo) return res.status(404).json({ error: "Promotion not found" });

    (await User.find({ promotion: true })).forEach(user => {
      sendPromotionalEmail(user.email, user.firstName, promo);
    });

    res.status(200).json({ message: "Successfully sent promotion emails" });
  } catch (error) {
    console.error("Send promotion emails error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/promotions/:promoId", async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.promoId);
    if (!promo) return res.status(404).json({ error: "Promotion not found" });
    res.status(200).json({ message: "Successfully deleted promotion" });
  } catch (error) {
    console.error("Delete promotion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/showrooms", async (req, res) => {
  try {
    const showrooms = await Showroom.find();
    res.status(200).json(showrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/showtimes", async (req, res) => {
  try {
    const showtimes = await Showtime.find();
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/showtimes/:movieId", async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movieId: req.params.movieId });
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE — Create a new showtime
app.post("/api/showtimes", async (req, res) => {
  try {
    const { movieId, movieTitle, showroom, date, time } = req.body;

    const showtime = await Showtime.findOne({ showroom, date, time });
    if (showtime) return res.status(409).json({ error: "Another movie is already showing at this room and time!" });

    const newShowtime = await Showtime.create({
      movieId,
      movieTitle,
      showroom,
      date,
      time,
      // seatMap is empty initially; frontend will render seats
    });

    res.status(200).json({ message: "Successfully added showtime", showtime: newShowtime});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/showtimes/:id", async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) return res.status(404).json({ error: "Showtime not found" });
    res.status(200).json({ message: "Successfully deleted showtime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ------------------------- SEAT SELECTION -------------------------
// GET seat status for a showtime
app.get("/api/showtimes/:id/seats", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    // Return only the held/sold info for seats
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

// POST — HOLD seats temporarily
app.post("/api/hold-seats", async (req, res) => {
  try {
    const { userId, showtimeId, seats } = req.body;
    if (!userId || !showtimeId || !seats?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if any seat is already booked
    const Booking = mongoose.model("Booking");
    const conflict = await Booking.findOne({
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
    console.error(err);
    res.status(500).json({ message: "Server error holding seats" });
  }
});

// DELETE — RELEASE an expired or cancelled hold
app.delete("/api/release-hold/:holdId", async (req, res) => {
  try {
    const hold = await SeatHold.findById(req.params.holdId);
    if (!hold) return res.status(404).json({ message: "Hold not found" });

    const showtime = await Showtime.findById(hold.showtimeId);
    hold.seats.forEach(seat => {
      if (showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "available";
      if (showtime.heldBy) delete showtime.heldBy[seat];
    });

    await showtime.save();
    await SeatHold.findByIdAndDelete(hold._id);

    res.json({ message: "Seat hold released" });
  } catch (err) {
    console.error("Release error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// AUTO-EXPIRE HOLDS every 60 seconds
setInterval(async () => {
  const now = Date.now();
  const expiredHolds = await SeatHold.find({ expiresAt: { $lt: now } });

  for (let hold of expiredHolds) {
    const showtime = await Showtime.findById(hold.showtimeId);
    hold.seats.forEach(seat => {
      if (showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "available";
      if (showtime.heldBy) delete showtime.heldBy[seat];
    });

    await showtime.save();
    await SeatHold.findByIdAndDelete(hold._id);
  }
}, 60 * 1000);

// POST — Confirm checkout
// POST — Confirm checkout
app.post("/api/checkout", async (req, res) => {
  try {
    const { userId, showtimeId, holdId, seats, tickets } = req.body;

    console.log("Checkout request body:", req.body); // Debug logging

    // 1️⃣ Validate required fields
    if (!userId || !showtimeId || !holdId || !seats?.length || !tickets) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Validate user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3️⃣ Validate hold
    const hold = await SeatHold.findById(holdId);
    if (!hold || hold.expiresAt < new Date()) {
      return res.status(400).json({ message: "Hold not found or expired" });
    }

    // 4️⃣ Validate showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    // 5️⃣ Calculate total
    const total =
      (tickets.adult || 0) * 12 +
      (tickets.child || 0) * 8 +
      (tickets.senior || 0) * 10;

    // 6️⃣ Create booking
    const booking = await Booking.create({
      user_id: user._id,        // must match schema field
      showtime_id: showtime._id, 
      seats,
      total,
    });

    // 7️⃣ Create tickets for each seat
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

    // 8️⃣ Insert tickets
    await Ticket.insertMany(ticketDocs);

    // 9️⃣ Remove the hold
    await SeatHold.findByIdAndDelete(holdId);

    // 🔟 Update showtime seat map to mark seats as sold
    seats.forEach((seat) => {
      if (showtime.seatMap[seat] === "held") showtime.seatMap[seat] = "sold";
      if (showtime.heldBy) delete showtime.heldBy[seat];
    });
    await showtime.save();

    res.status(200).json({ message: "Booking confirmed", bookingId: booking._id });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error during checkout", error: err });
  }
});



const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));