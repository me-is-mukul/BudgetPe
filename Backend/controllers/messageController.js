import Message from "../models/Message.js";

// GET /api/messages  — fetch all messages for the logged-in user
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

export { getMessages };
