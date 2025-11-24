import mongoose from "mongoose";

const ShowroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  seats: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Showroom", ShowroomSchema);