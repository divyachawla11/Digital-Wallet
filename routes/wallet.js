const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { checkForFraud, sendEmailAlert } = require("../utils/fraudCheck");

const router = express.Router();
router.use(authMiddleware);

// Deposit funds (no fraud check)
router.post("/deposit", async (req, res) => {
  const { amount, currency } = req.body;
  if (!currency) return res.status(400).json({ message: "Currency is required" });
  if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

  try {
    const user = await User.findOne({ _id: req.user.userId, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found or deleted" });

    const currentBalance = user.balance.get(currency) || 0;
    user.balance.set(currency, currentBalance + amount);
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: "deposit",
      amount,
      currency,
      flagged: false, 
      isDeleted: false,
    });
    await transaction.save();

    res.json({ message: "Deposit successful", balance: user.balance.get(currency) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw funds (check for large amount)
router.post("/withdraw", async (req, res) => {
  const { amount, currency } = req.body;
  if (!currency) return res.status(400).json({ message: "Currency is required" });
  if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

  try {
    const user = await User.findOne({ _id: req.user.userId, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found or deleted" });

    const currentBalance = user.balance.get(currency) || 0;
    if (currentBalance < amount) return res.status(400).json({ message: "Insufficient balance" });

    user.balance.set(currency, currentBalance - amount);
    await user.save();

    const flagged = await checkForFraud(user._id, amount, "withdraw");

    if (flagged) {
      await sendEmailAlert(user.email, amount, "withdraw");
    }

    const transaction = new Transaction({
      user: user._id,
      type: "withdraw",
      amount,
      currency,
      flagged,
      isDeleted: false,
    });
    await transaction.save();

    res.json({ message: "Withdrawal successful", balance: user.balance.get(currency) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer funds (check for high frequency transfers only)
router.post("/transfer", async (req, res) => {
  const { amount, recipientEmail, currency } = req.body;
  if (!recipientEmail || !currency) return res.status(400).json({ message: "Recipient email and currency are required" });
  if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

  try {
    const sender = await User.findOne({ _id: req.user.userId, isDeleted: false });
    if (!sender) return res.status(404).json({ message: "Sender not found or deleted" });

    const senderBalance = sender.balance.get(currency) || 0;
    if (senderBalance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const recipient = await User.findOne({ email: recipientEmail, isDeleted: false });
    if (!recipient) return res.status(404).json({ message: "Recipient not found or deleted" });
    if (recipient._id.equals(sender._id)) return res.status(400).json({ message: "Cannot transfer to yourself" });

    sender.balance.set(currency, senderBalance - amount);
    recipient.balance.set(currency, (recipient.balance.get(currency) || 0) + amount);

    await sender.save();
    await recipient.save();

    const flaggedSender = await checkForFraud(sender._id, amount, "transfer");

    if (flaggedSender) {
      await sendEmailAlert(sender.email, amount, "transfer");
    }

    const senderTransaction = new Transaction({
      user: sender._id,
      type: "transfer",
      amount,
      currency,
      recipient: recipient._id,
      flagged: flaggedSender,
      isDeleted: false,
    });
    await senderTransaction.save();

    const recipientTransaction = new Transaction({
      user: recipient._id,
      type: "deposit",
      amount,
      currency,
      recipient: sender._id,
      flagged: false, 
      isDeleted: false,
    });
    await recipientTransaction.save();

    res.json({ message: "Transfer successful", balance: sender.balance.get(currency) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View all transactions of the logged-in user
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId, isDeleted: false }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View flagged transactions
router.get("/flagged", async (req, res) => {
  try {
    const flaggedTransactions = await Transaction.find({
      user: req.user.userId,
      flagged: true,
      isDeleted: false,
    }).sort({ date: -1 });

    res.json(flaggedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
