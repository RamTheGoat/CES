import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, required: true },
    role: { type: String, required: true },
    paymentCards: { type: [{
        cardNumber: { type: Number, required: true },
        expirationMonth: { type: Number, required: true },
        expirationYear: { type: Number, required: true },
        securityCode: { type: Number, required: true }
    }], required: false }
});

const User = mongoose.model("User", userSchema);
export default User;
