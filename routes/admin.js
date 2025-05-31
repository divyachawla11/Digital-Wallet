const express = require("express");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Apply authentication and admin check middleware for all admin routes
router.use(authMiddleware);
router.use(adminAuth);

// 1. View all flagged transactions (exclude deleted)
router.get("/flagged", async (req, res) => {
  try {
    const flaggedTx = await Transaction.find({ flagged: true, isDeleted: false }).sort({ date: -1 });
    res.json(flaggedTx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Aggregate total balances per currency (exclude deleted users)
router.get("/total-balance", async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { isDeleted: false } }, // exclude deleted users
      {
        $project: {
          balanceArray: { $objectToArray: "$balance" }
        }
      },
      { $unwind: "$balanceArray" },
      {
        $group: {
          _id: "$balanceArray.k",
          total: { $sum: "$balanceArray.v" }
        }
      }
    ]);

    const totals = {};
    result.forEach(r => {
      totals[r._id] = r.total;
    });

    res.json({ totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Top users by total balance or transaction volume (exclude deleted users and transactions)
router.get("/top-users", async (req, res) => {
  try {
    const { sortBy = "balance", limit = 10 } = req.query;

    if (!["balance", "transactionVolume"].includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sortBy parameter" });
    }

    if (sortBy === "balance") {
      // Compute total balance (sum of all currencies) and sort, exclude deleted users
      const users = await User.aggregate([
        { $match: { isDeleted: false } }, // exclude deleted users
        {
          $project: {
            email: 1,
            balanceArray: { $objectToArray: "$balance" }
          }
        },
        {
          $addFields: {
            totalBalance: { $sum: "$balanceArray.v" }
          }
        },
        { $sort: { totalBalance: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            email: 1,
            balance: 1,
            totalBalance: 1
          }
        }
      ]);
      res.json(users);
    } else {
      // Sort by total transaction volume, exclude deleted transactions and users
      const users = await Transaction.aggregate([
        { $match: { isDeleted: false } }, // exclude deleted transactions
        {
          $group: {
            _id: "$user",
            totalAmount: { $sum: "$amount" }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: "$userInfo" },
        { $match: { "userInfo.isDeleted": false } }, // exclude deleted users
        {
          $project: {
            userId: "$userInfo._id",
            email: "$userInfo.email",
            balance: "$userInfo.balance",
            totalAmount: 1
          }
        }
      ]);
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Soft delete user by ID
router.delete("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: "User soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Soft delete transaction by ID
router.delete("/transaction/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.isDeleted) {
      return res.status(404).json({ message: "Transaction not found or already deleted" });
    }

    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    res.json({ message: "Transaction soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
