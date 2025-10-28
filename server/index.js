import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import Movie from "./models/Movie.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
    const { firstName, lastName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      isActive: false, // initially inactive
    });

    await newUser.save();

    // Send confirmation email (inform user account created)
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
      subject: "Registration Confirmation",
      html: `<h2>Hello, ${firstName}</h2><p>Your account has been created. You will be active after your first login.</p>`,
    });

    res.status(201).json({ message: "User registered successfully. Confirmation email sent." });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    // Activate user on first login
    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    // Check temporary password
    if (user.mustChangePassword) {
      if (user.tempPasswordExpires && user.tempPasswordExpires < Date.now()) {
        return res.status(401).json({ message: "Temporary password expired. Request a new one." });
      }
      return res.status(200).json({
        message: "Login successful — temporary password in use. Change required.",
        user: { _id: user._id, email: user.email, firstName: user.firstName },
        mustChangePassword: true
      });
    }

    // Normal login
    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, email: user.email, firstName: user.firstName, isActive: user.isActive },
      mustChangePassword: false
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
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
      if (req.body[prop] != null) changes[prop] = req.body[prop];
    }

    const result = await User.updateOne({ _id: profile._id }, { $set: changes });
    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit user profile was successful" });
    return res.status(200).json({ message: "No changes were made to the user profile" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    if (req.body.cardType && req.body.lastFour && req.body.expirationMonth && req.body.expirationYear) {
      newCard.cardType = req.body.cardType;
      newCard.lastFour = req.body.lastFour;
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

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));