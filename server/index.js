import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import Movie from "./models/Movie.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

async function sendProfileUpdateEmail(email, name, updatedField) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com", 
        pass: "wpyhctrfiwlroqea",   
      },
    });

    const mailOptions = {
      from: '"E-Cinema Support" <yourgmail@gmail.com>',
      to: email,
      subject: "Your account was updated",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your ${updatedField} was successfully updated on your E-Cinema account.</p>
        <p>If you didn’t make this change, please reset your password immediately.</p>
        <br>
        <p>Thank you,<br>The E-Cinema Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} about ${updatedField} update`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
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
      // Generate token for temporary login
      const token = jwt.sign(
        { id: user._id, email: user.email, mustChangePassword: true, role: user.role },
          JWT_SECRET, 
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login successful — temporary password in use. Change required.",
        token,
        user: { 
          _id: user._id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          role: user.role
        },
        mustChangePassword: true
      });
    }

    // Normal login
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
        role: user.role
      },
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
      if (req.body[prop] != null && req.body[prop] !== profile[prop]) {
        changes[prop] = req.body[prop];
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: "No changes were made to the user profile" });
    }

    await User.updateOne({ _id: profile._id }, { $set: changes });

    await sendProfileUpdateEmail(profile.email, profile.firstName, "profile information");

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

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));