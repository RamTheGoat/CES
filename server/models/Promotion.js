import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: [true, "Promotion code already exists!"] },
    discount: { type: Number, required: true },
    expiration: { type: Date, required: true },
    message: { type: String, required: true },
});

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;