const cron = require("node-cron");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected for fraud scan"))
    .catch(err => console.error("❌ Mongo connection error:", err));

    // cron.schedule("*/10 * * * * *", async () => { // every 10 sec for testing
    cron.schedule("0 0 * * *", async () => { // daily at midnight
    console.log("📅 Running daily fraud scan...");

    try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find suspicious transactions in last 24h, large amount, not flagged, and type withdraw
        const suspiciousTxs = await Transaction.find({
        amount: { $gte: 10000 },
        flagged: false,
        type: "withdraw",
        date: { $gte: yesterday },
        isDeleted: false
    });

    for (let tx of suspiciousTxs) {
        tx.flagged = true;
        tx.flagReason = "Scheduled scan: large withdrawal";
        await tx.save();
    }

        console.log(`✅ Scan complete. Flagged ${suspiciousTxs.length} transaction(s).`);
    } catch (err) {
        console.error("❌ Error during scheduled fraud scan:", err.message);
    }
});
