const Transaction = require("../models/Transaction");

const LARGE_AMOUNT = 10000;
const MAX_TX_IN_1_MIN = 3;

/**
 * Checks for suspicious activity based on transaction type
 *
 * @param {String} userId - User's MongoDB ID
 * @param {Number} amount - Transaction amount
 * @param {String} type - "withdraw", "transfer", or "deposit"
 * @returns {Boolean} flagged - Whether suspicious
 */
async function checkForFraud(userId, amount, type) {
  let flagged = false;

  // Rule: Large withdrawal
  if (type === "withdraw" && amount >= LARGE_AMOUNT) {
    flagged = true;
  }

  // Rule: Too many transfers in short time
  if (type === "transfer") {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentTransferCount = await Transaction.countDocuments({
      user: userId,
      type: "transfer",
      date: { $gte: oneMinuteAgo },
    });

    if (recentTransferCount >= MAX_TX_IN_1_MIN) {
      flagged = true;
    }
  }

  // Deposits are never flagged
  return flagged;
}

/**
 * Sends a mock email alert for flagged transactions
 *
 * @param {String} userEmail
 * @param {Number} amount
 * @param {String} type - transaction type
 */
async function sendEmailAlert(userEmail, amount, type) {
  console.log(`*** EMAIL ALERT ***`);
  console.log(`User: ${userEmail}`);
  console.log(`Alert: Suspicious ${type} detected!`);
  console.log(`Amount: ${amount}`);
  console.log(`*******************`);
}

module.exports = { checkForFraud, sendEmailAlert };
