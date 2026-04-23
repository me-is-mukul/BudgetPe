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
    console.log(`[register] attempt — email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`[register] failed — email already registered: ${email}`);
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, phoneNumber, password });
    console.log(`[register] success — user created: ${user._id} (${email})`);
    sendToken(user, 201, res);
  } catch (error) {
    console.error(`[register] error — ${error.message}`);
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[login] attempt — email: ${email}`);

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      console.warn(`[login] failed — invalid credentials for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[login] success — user: ${user._id} (${email})`);
    sendToken(user, 200, res);
  } catch (error) {
    console.error(`[login] error — ${error.message}`);
    next(error);
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  console.log(`[getMe] user: ${req.user._id} (${req.user.email})`);
  res.status(200).json({ user: req.user });
};

// POST /api/auth/logout
const logout = (req, res) => {
  console.log(`[logout] user: ${req.user._id} (${req.user.email})`);
  res.status(200).json({ message: "Logged out successfully" });
};

export { register, login, getMe, logout };
