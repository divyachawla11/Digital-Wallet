const mongoose = require("mongoose");

// Define schema for User collection
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },            // User’s full name, required
    email: { type: String, required: true, unique: true },  // Email, must be unique (no duplicates)
    password: { type: String, required: true },         // Hashed password, required
    balance: {
        type: Map,
        of: Number,
        default: {}
    },
    isAdmin: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
});

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
