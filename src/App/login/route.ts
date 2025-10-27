import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../../../server/models/User.js"; 

const app = express();
app.use(express.json());

// connect to MongoDB
mongoose.connect("mongodb+srv://rampatel4204:Patel4204@ces.yybxumv.mongodb.net/Movies/users")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


app.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body); 

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("👤 Found user:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("✅ Login successful for:", email);
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
