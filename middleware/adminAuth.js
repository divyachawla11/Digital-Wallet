const User = require("../models/User");

async function adminAuth(req, res, next) {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.isDeleted) {
      return res.status(403).json({ message: "Admin not found or has been deleted" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

module.exports = adminAuth;
