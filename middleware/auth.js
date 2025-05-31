const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user exists and is not soft-deleted
    const user = await User.findById(decoded.userId);
    if (!user || user.isDeleted) {
      return res.status(403).json({ message: "User not found or has been deleted" });
    }

    req.user = decoded; // attach token payload (userId, isAdmin) to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
