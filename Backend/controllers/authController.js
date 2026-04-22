import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, phoneNumber, password });
    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export { register, login, getMe, logout };
