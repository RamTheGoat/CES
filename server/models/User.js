import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: { type: String, required: false},
    isActive: { type: Boolean, default: false },   
    verificationToken: { type: String } ,
    role: { type: String, default: "user"},
    promotion: { type: Boolean, required: false },
    paymentCards: { type: [{
        cardType: { type: String, required: true },
        lastFour: { type: Number, required: true },
        expirationMonth: { type: Number, required: true },
        expirationYear: { type: Number, required: true }
    }], required: false }
});

const User = mongoose.model("User", userSchema);
export default User;
