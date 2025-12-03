// routes/showrooms.js
import express from "express";
import Showroom from "../models/Showroom.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const showrooms = await Showroom.find();
    res.status(200).json(showrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
