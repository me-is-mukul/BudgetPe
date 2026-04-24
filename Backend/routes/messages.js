import { Router } from "express";
import {
  generateCategoryReport,
  getBehaviorInsights,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessageValidator } from "../validators/messageValidator.js";

const router = Router();

router.get("/", protect, getMessages);
router.get("/insights", protect, getBehaviorInsights);
router.post("/report", protect, generateCategoryReport);
router.post("/", protect, sendMessageValidator, sendMessage);

export default router;
