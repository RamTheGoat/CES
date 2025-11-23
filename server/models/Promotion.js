import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    code: String,
    discount: Number,
    expiration: Date,
    message: String
});

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;