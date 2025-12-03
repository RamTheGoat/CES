// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import moviesRoutes from "./routes/movieRoutes.js";
import showroomRoutes from "./routes/showroomRoutes.js";
import showtimeRoutes from "./routes/showtimeRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rampatel4204:Patel4204@ces.yybxumv.mongodb.net/Movies", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Mount routes (all keep same base paths)
app.use("/", authRoutes);                 // register, login, verify, forgot-password
app.use("/api/users", usersRoutes);       // /api/users, /api/users/:userId, /api/users/...
app.use("/api/movies", moviesRoutes);     // /api/movies, /api/movies/:id
app.use("/api/showrooms", showroomRoutes); // /api/showrooms
app.use("/api/showtimes", showtimeRoutes); // /api/showtimes endpoints (including seats GET)
app.use("/api/promotions", promotionRoutes); // promotions CRUD + send emails
app.use("/", bookingRoutes);             // hold-seats, release-hold, checkout, /api/bookings

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
