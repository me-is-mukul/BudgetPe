import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessageValidator } from "../validators/messageValidator.js";

const router = Router();

router.get("/", protect, getMessages);
router.post("/", protect, sendMessageValidator, sendMessage);

export default router;
