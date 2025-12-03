// routes/promotions.js
import express from "express";
import Promotion from "../models/Promotion.js";
import User from "../models/User.js";
import { sendPromotionalEmail } from "../mailer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.status(200).json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newPromo = await Promotion.create(req.body);
    if (!newPromo) throw new Error("Failed to create the promotion");
    else res.status(200).json({ message: "Successfully added promotion", promotion: newPromo });
  } catch (error) {
    console.error("Add promotion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:promoId", async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.promoId);
    if (!promo) return res.status(404).json({ error: "Promotion not found" });

    (await User.find({ promotion: true })).forEach(user => {
      sendPromotionalEmail(user.email, user.firstName, promo);
    });

    res.status(200).json({ message: "Successfully sent promotion emails" });
  } catch (error) {
    console.error("Send promotion emails error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:promoId", async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.promoId);
    if (!promo) return res.status(404).json({ error: "Promotion not found" });
    res.status(200).json({ message: "Successfully deleted promotion" });
  } catch (error) {
    console.error("Delete promotion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
