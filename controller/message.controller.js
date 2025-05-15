import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { errorHandler } from "../utils/errorHandle.js";
import Conversation from "../models/conversation.models.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";

/* -------------------------------------------
   🔁 Utility to find or create conversation
-------------------------------------------- */
const findOrCreateConversation = async ({ buyerId, sellerId, productId = null }) => {
  const query = {
    participants: { $all: [buyerId, sellerId] },
    ...(productId ? { productId } : { productId: null }),
  };

  let conversation = await Conversation.findOne(query).populate("participants messages");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [buyerId, sellerId],
      productId: productId || null,
    });
  }

  return Conversation.findById(conversation._id).populate("participants messages");
};

/* -------------------------------------------
   ✅ 1. Open Chat (from product page)
-------------------------------------------- */
export const openChat = asyncHandler(async (req, res) => {
  const { sellerId, productId, productName } = req.body;
  const { _id: buyerId } = req.user;

  if (!sellerId) throw new errorHandler(400, "Seller ID is required");

  const conversation = await findOrCreateConversation({ buyerId, sellerId, productId });

  if (conversation.messages.length === 0 && productName) {
    const initialMessage = await Message.create({
      author: buyerId,
      content: `Hi, I'm interested in this product: ${productName}`,
      type: "Text",
      isInitial: true,
    });

    conversation.messages.push(initialMessage._id);
    conversation.lastMessage = initialMessage.content;
    await conversation.save();
  }

  return res.status(200).json(new apiResponse(200, { conversation }, "Chat initialized"));
});

/* -------------------------------------------
   ✅ 2. Start Generic Chat (from navbar)
-------------------------------------------- */
export const startConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { _id: currentUserId } = req.user;

  const conversation = await findOrCreateConversation({ buyerId: currentUserId, sellerId: userId });

  return res.status(200).json(new apiResponse(200, { conversation }, "Conversation started"));
});

/* -------------------------------------------
   ✅ 3. Send Message
-------------------------------------------- */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;
  const { _id: userId } = req.user;

  if (!message?.trim()) throw new errorHandler(400, "Message cannot be empty");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new errorHandler(404, "Conversation not found");

  const newMessage = await Message.create({
    author: userId,
    content: message.trim(),
    type: "Text",
  });

  conversation.messages.push(newMessage._id);
  conversation.lastMessage = newMessage.content;
  conversation.isSeenBy = [userId];
  await conversation.save();

  // Emit socket message to other user(s)
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("newMessage", {
      conversationId,
      message: newMessage,
    });
  }

  return res.status(200).json(new apiResponse(200, { message: newMessage }, "Message sent"));
});

/* -------------------------------------------
   ✅ 4. Flag Message
-------------------------------------------- */
export const flagMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findByIdAndUpdate(messageId, { flagged: true }, { new: true });
  if (!message) throw new errorHandler(404, "Message not found");

  return res.status(200).json(new apiResponse(200, message, "Message flagged successfully"));
});

/* -------------------------------------------
   ✅ 5. Get Chat Inbox Preview (last message)
-------------------------------------------- */
export const getChatHistory = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;

  const conversations = await Conversation.find({
    participants: { $in: [userId] },
  })
    .populate("participants", "name avatar email role")
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

  const chatList = conversations.map((conv) => {
    const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
    const lastMsg = conv.messages[0];

    return {
      userId: otherUser._id,
      userName: otherUser.name,
      userAvatar: otherUser.avatar,
      role: otherUser.role,
      lastMessage: conv.lastMessage || lastMsg?.content || "",
      lastMessageTime: lastMsg?.createdAt || null,
      isSeen: conv.isSeenBy?.includes(userId),
      productId: conv.productId || null,
    };
  });

  return res.json(
    new apiResponse(200, role === "seller" ? { buyersMessaged: chatList } : { sellersChattedWith: chatList }, "Chat history retrieved successfully")
  );
});

/* -------------------------------------------
   ✅ 6. Get Full Conversations (All Messages)
-------------------------------------------- */
export const getConversations = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const conversations = await Conversation.find({
    participants: { $in: [_id] },
  }).populate("participants messages");

  return res.json(new apiResponse(200, { conversations }, "Conversations fetched"));
});

/* -------------------------------------------
   ✅ 7. Mark Messages as Seen (Socket Event)
-------------------------------------------- */
export const markAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { _id: userId } = req.user;

  await Conversation.findByIdAndUpdate(conversationId, {
    $addToSet: { isSeenBy: userId },
  });

  return res.status(200).json(new apiResponse(200, {}, "Conversation marked as seen"));
});
