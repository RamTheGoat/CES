import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Movie from "./models/Movie.js";
import Booking from "./models/Booking.js";
import UserProfile from "./models/UserProfile.js";

const app = express();
app.use(cors({
  origin: "http://localhost:3000",  // React app URL
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Connect to MongoDB Atlus
mongoose.connect("mongodb+srv://rampatel4204:Patel4204@ces.yybxumv.mongodb.net/Movies", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
/*
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});
*/

.then(async () => {
    console.log("MongoDB connected");

    // Fetch all movies and print to console
    try {
        const movies = await Movie.find();
        console.log("Movies in DB:", movies);
    } catch (err) {
        console.error("Error fetching movies:", err);
    }
})
.catch(err => console.error("MongoDB connection error:", err));

// Get Movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single movie by ID
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
      .populate("user_id", "name email")
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

app.get("/api/users/:userId", async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });
    else return res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST edit user profile
app.post("/api/users/edit/:userId", async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    let changes = {};
    for (let prop in profile.toObject()) {
      if (req.body[prop]) changes[prop] = req.body[prop];
    }

    // Update the user with the profile id
    let filter = { _id: profile._id };
    const result = await UserProfile.updateOne(filter, { '$set': changes });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit user profile was successful" });
    else return res.status(200).json({ message: "No changes were made to the user profile" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST edit user payment card
app.post("/api/users/card/edit/:cardId", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ "paymentCards._id": req.params.cardId });
    if (!profile) return res.status(404).json({ error: "Payment card not found" });
    const card = await profile.paymentCards.find(c => c._id.equals(req.params.id));
    if (!card) return res.status(404).json({ error: "Payment card not found" });

    let changes = {};
    for (let prop in card.toObject()) {
      if (req.body[prop]) changes[`paymentCards.$.${prop}`] = req.body[prop];
    }

    // Update the payment card with the card id
    let filter = { 'paymentCards._id': card._id };
    const result = await UserProfile.updateOne(filter, { '$set': changes });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));