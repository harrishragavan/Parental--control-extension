import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";

import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/verify-password", async (req, res) => {
    const { password, site } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare the entered password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }
  
      // If the password is correct, allow the site to be removed
      res.status(200).json({ message: "Password verified successfully" });
    } catch (err) {
      console.error("Error verifying password:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));