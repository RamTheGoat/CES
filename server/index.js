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

// POST edit user profile
app.post("/api/users/edit/:id", async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: "User profile not found" });
    const data = req.body;

    // Ensure the payment card data is complete to avoid deleting any card data
    if (data.paymentCard) {
      let editCard = profile.paymentCard;
      for (let prop in profile.toObject().paymentCard)
        if (data.paymentCard[prop]) editCard[prop] = data.paymentCard[prop];
      data.paymentCard = editCard;
    }

    // Update the user with the profile id
    let filter = { _id: profile.id };
    const result = await UserProfile.updateOne(filter, data);

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit user profile was successful" });
    else return res.status(200).json({ message: "No changes were made to the user profile" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));