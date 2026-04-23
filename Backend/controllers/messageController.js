import Message from "../models/Message.js";

// GET /api/messages  — fetch all messages for the logged-in user
const getMessages = async (req, res, next) => {
  try {
    console.log(`[getMessages] fetching for user: ${req.user._id}`);
    const messages = await Message.find({ user: req.user._id }).sort({ date: -1 });
    console.log(`[getMessages] success — ${messages.length} message(s) returned`);
    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    console.error(`[getMessages] error — ${error.message}`);
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { category, amount, date } = req.body;
    console.log(`[sendMessage] attempt — user: ${req.user._id}, category: ${category}, amount: ${amount}`);

    if (!category || amount === undefined) {
      console.warn(`[sendMessage] failed — missing required fields (category, amount)`);
      return res.status(400).json({ message: "category and amount are required" });
    }

    const newMessage = new Message({
      user: req.user._id,
      category,
      amount,
      date: date || Date.now(),
    });

    const savedMessage = await newMessage.save();
    console.log(`[sendMessage] success — message saved: ${savedMessage._id}`);
    res.status(201).json("Message sent successfully");
  } catch (error) {
    console.error(`[sendMessage] error — ${error.message}`);
    next(error);
  }
};

export { getMessages, sendMessage };
