import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import Movie from "./models/Movie.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";

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
.then(async () => {
    console.log("MongoDB connected");

    // Fetch all movies and print to console
    try {
        const movies = await Movie.find();
        //console.log("Movies in DB:", movies);
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
      });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: "User not found" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

      res.status(200).json({ message: "Login successful", user });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  
  const PORT = 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));