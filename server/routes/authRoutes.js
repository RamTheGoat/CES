import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendProfileUpdateEmail } from "../mailer.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]";
  let pw = "";
  for (let i = 0; i < length; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, agreeToTerms, acceptPromos } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      address: "",
      isActive: false,
      verificationToken,
      promotion: acceptPromos,
    });

    await newUser.save();

    const verifyUrl = `http://localhost:4000/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",
        pass: "wpyhctrfiwlroqea",
      },
    });

    await transporter.sendMail({
      from: '"E-Cinema" <Jiexian0902@gmail.com>',
      to: email,
      subject: "Verify Your E-Cinema Account",
      html: `<h2>Hello, ${firstName}</h2><p>Click below to verify your account:</p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a>`,
    });

    res.status(201).json({ message: "User registered successfully. Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// EMAIL VERIFY
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send("<h3>Invalid or expired verification link.</h3>");

    user.isActive = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("<h3>Your account has been verified successfully! You can now log in.</h3>");
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).send("<h3>Server error. Please try again later.</h3>");
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tempPassword = generateTempPassword(12);
    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    user.password = hashedTemp;
    user.mustChangePassword = true;
    user.tempPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",
        pass: "wpyhctrfiwlroqea",
      },
    });

    const emailHtml = `
      <h2>Hello ${user.firstName || ""}</h2>
      <p>You requested a password reset. A temporary password has been generated:</p>
      <p style="font-weight:bold; font-size:16px; padding:8px; border:1px solid #ddd; display:inline-block;">${tempPassword}</p>
      <p>This temporary password expires in 1 hour. Please log in and change your password immediately.</p>
    `;

    await transporter.sendMail({
      from: '"E-Cinema" <Jiexian0902@gmail.com>',
      to: email,
      subject: "E-Cinema — Temporary Password",
      html: emailHtml,
    });

    res.status(200).json({ message: "Temporary password emailed. Check your inbox." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is not verified. Please check your email for the verification link." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    if (user.mustChangePassword) {
      if (user.tempPasswordExpires && user.tempPasswordExpires < Date.now()) {
        return res.status(401).json({ message: "Temporary password expired. Request a new one." });
      }
      const token = jwt.sign({ id: user._id, email: user.email, mustChangePassword: true, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({
        message: "Login successful — temporary password in use. Change required.",
        token,
        user: { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, isActive: user.isActive, role: user.role },
        mustChangePassword: true,
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, isActive: user.isActive, role: user.role },
      mustChangePassword: false,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
