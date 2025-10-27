import express from "express";
import mongoose from "mongoose";
import User from "../../../server/models/User.js";

const app = express();
app.use(express.json());

// connect to MongoDB
mongoose.connect("mongodb+srv://rampatel4204:Patel4204@ces.yybxumv.mongodb.net/Movies/users")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));



// register route
app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ firstName, lastName, email, phone, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
