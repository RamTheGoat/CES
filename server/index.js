import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Movie from "./models/Movie.js";

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
.then(() => {
    console.log("✅ MongoDB connected");
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
  
  const PORT = 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));