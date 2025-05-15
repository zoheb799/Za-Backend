import express from "express";
import {
  getChatHistory,
  openChat,
  sendMessage,
  startConversation,
  getConversations,
  flagMessage,
  markAsSeen
} from "../controller/message.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Apply auth to all message routes
router.use(authenticateUser);

// 📨 Inbox preview (last messages)
router.get("/history", getChatHistory);

// 💬 Start a product-based chat
router.post("/open-chat", openChat);

// 💬 Start a generic chat (navbar)
router.post("/conversation-start", startConversation);

// 💬 Send message
router.post("/send-message", sendMessage);

// 📄 Get full conversation threads
router.get("/conversations", getConversations);

// 🚩 Flag a specific message
router.patch("/flag/:messageId", flagMessage);

// 👀 Mark a conversation as seen
router.patch("/seen/:conversationId", markAsSeen);

export default router;
