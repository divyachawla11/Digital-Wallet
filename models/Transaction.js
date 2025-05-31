// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR'], // add more as needed
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for transfers
  flagged: { type: Boolean, default: false }, // for fraud detection flags
  flagReason: { type: String },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Transaction", transactionSchema);
