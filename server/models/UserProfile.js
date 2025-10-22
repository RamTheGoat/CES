import mongoose from "mongoose";

// please change anything if its wrong

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    passwordHash: String,
    address: String,
    status: String,
    createdAt: Date,
    role: String,
    paymentCard: {
        cardNumber: Number,
        expirationMonth: Number,
        expirationYear: Number,
        securityCode: Number
    }
});

export default mongoose.model("UserProfile", userProfileSchema, "users");