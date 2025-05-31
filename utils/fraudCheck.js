const Transaction = require("../models/Transaction");

// Rule thresholds
const LARGE_AMOUNT = 10000;       // Flag if amount >= this
const MAX_TX_IN_1_MIN = 3;        // Max allowed transactions per minute

/**
 * Checks for suspicious activity based on:
 * 1. Large transaction amount
 * 2. Too many transactions in a short time
 * 
 * @param {String} userId - User's MongoDB ID
 * @param {Number} amount - Transaction amount
 * @returns {Boolean} flagged - Whether this transaction is suspicious
 */
async function checkForFraud(userId, amount) {
  let flagged = false;

  // Rule 1: Flag large transactions
  if (amount >= LARGE_AMOUNT) {
    flagged = true;
  }

  // Rule 2: Flag rapid transaction frequency
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentTxCount = await Transaction.countDocuments({
    user: userId,
    date: { $gte: oneMinuteAgo },
  });

  if (recentTxCount >= MAX_TX_IN_1_MIN) {
    flagged = true;
  }

  return flagged;
}

module.exports = checkForFraud;
