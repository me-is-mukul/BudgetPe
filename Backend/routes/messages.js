import { Router } from "express";
import { getMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getMessages);

export default router;
