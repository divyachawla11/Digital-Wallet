// server.js
require("./jobs/dailyFraudScan");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const walletRoutes = require("./routes/wallet");
app.use("/api/wallet", walletRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Digital Wallet API is running.");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
