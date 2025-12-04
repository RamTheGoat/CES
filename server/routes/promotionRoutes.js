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

// GET - Validate promo code
router.get("/validate/:code", async (req, res) => {
  try {
    const promo = await Promotion.findOne({ code: req.params.code.toUpperCase() });
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    
    // Check if promotion is expired using your schema's 'expiration' field
    const now = new Date();
    const expirationDate = new Date(promo.expiration); // Your schema uses 'expiration'
    
    // Check if expirationDate is valid
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({ 
        message: "Invalid expiration date for promotion" 
      });
    }
    
    // Check if promotion has expired
    if (now > expirationDate) {
      return res.status(400).json({ 
        message: "This promotion has expired" 
      });
    }
    
    res.json({ 
      message: "Promo code valid", 
      promotion: {
        code: promo.code,
        discount: promo.discount, // Your schema uses 'discount'
        expiration: promo.expiration, // Your schema uses 'expiration'
        message: promo.message // Your schema uses 'message'
      }
    });
  } catch (err) {
    console.error("Promo validation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
