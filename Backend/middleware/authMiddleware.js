import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn(`[auth] rejected — no token on ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.warn(`[auth] rejected — user not found for token id: ${decoded.id}`);
      return res.status(401).json({ message: "User no longer exists" });
    }

    console.log(`[auth] authorized — user: ${req.user._id} on ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.warn(`[auth] rejected — invalid token: ${error.message}`);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export { protect };
