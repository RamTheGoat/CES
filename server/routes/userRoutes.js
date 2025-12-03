// routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendProfileUpdateEmail } from "../mailer.js";

const router = express.Router();

// GET all user profiles
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user profile
router.get("/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });
    return res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit user profile
router.put("/edit/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    let changes = {};
    for (let prop in profile.toObject()) {
      if (req.body[prop] != null && req.body[prop] !== profile[prop]) {
        changes[prop] = req.body[prop];
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: "No changes were made to the user profile" });
    }

    await User.updateOne({ _id: profile._id }, { $set: changes });

    if (!req.body.dontSendProfileUpdateEmail) {
      await sendProfileUpdateEmail(profile.email, profile.firstName, "profile information");
    }

    return res.status(200).json({ message: "Edit user profile was successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT edit user password
router.put("/password/edit/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    const isPasswordValid = await bcrypt.compare(req.body.current, profile.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Current password is invalid" });

    let filter = { _id: profile._id };
    let changes = { password: await bcrypt.hash(req.body.new, 10) };
    const result = await User.updateOne(filter, { $set: changes });

    if (result.modifiedCount > 0) {
      await sendProfileUpdateEmail(profile.email, profile.firstName, "password");
      return res.status(200).json({ message: "Edit user password was successful" });
    }

    return res.status(200).json({ message: "No changes were made to the user password" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Payment card routes (add/edit/remove)
router.put("/card/edit/:cardId", async (req, res) => {
  try {
    const profile = await User.findOne({ "paymentCards._id": req.params.cardId });
    if (!profile) return res.status(404).json({ error: "Payment card not found" });
    const card = await profile.paymentCards.find(c => c._id.equals(req.params.cardId));
    if (!card) return res.status(404).json({ error: "Payment card not found" });

    let changes = {};
    for (let prop in card.toObject()) {
      if (req.body[prop] != null) changes[`paymentCards.$.${prop}`] = req.body[prop];
    }

    let filter = { 'paymentCards._id': card._id };
    const result = await User.updateOne(filter, { $set: changes });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Edit payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/card/remove/:cardId", async (req, res) => {
  try {
    const profile = await User.findOne({ "paymentCards._id": req.params.cardId });
    if (!profile) return res.status(404).json({ error: "Payment card not found" });
    const card = await profile.paymentCards.find(c => c._id.equals(req.params.cardId));
    if (!card) return res.status(404).json({ error: "Payment card not found" });

    let filter = { 'paymentCards._id': card._id };
    const result = await User.updateOne(filter, { $pull: { paymentCards: { _id: card._id } } });

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Remove payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/card/add/:userId", async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId);
    if (!profile) return res.status(404).json({ error: "User profile not found" });

    if (profile.paymentCards.length >= 4) {
      return res.status(409).json({ error: "Cannot add more than 4 payment cards" });
    }

    let newCard = {};
    if (req.body.cardType && req.body.cardNumber && req.body.expirationMonth && req.body.expirationYear) {
      newCard.cardType = req.body.cardType;
      newCard.cardNumber = await bcrypt.hash(req.body.cardNumber, 10);
      newCard.lastFour = req.body.cardNumber.slice(-4);
      newCard.expirationMonth = req.body.expirationMonth;
      newCard.expirationYear = req.body.expirationYear;
    } else {
      return res.status(422).json({ error: "Add payment card information is incomplete" });
    }

    let filter = { '_id': profile._id };
    const result = await User.updateOne(filter, { $push: { paymentCards: { $each: [newCard], $position: 0 }}});

    if (result.modifiedCount > 0) return res.status(200).json({ message: "Add payment card was successful" });
    else return res.status(200).json({ message: "No changes were made to the payment card" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
