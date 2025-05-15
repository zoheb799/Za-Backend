import Conversation from "../models/conversation.models.js";
import Message from "../models/message.models.js";

const newMessageHandler = async (socket, data, io) => {
  const { message, conversationId } = data;
  const { author, receiver, content, media, document, type } = message;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return socket.emit("error", { message: "Conversation not found" });
    }

    const newMessage = await Message.create({
      author,
      receiver,
      content,
      media,
      document,
      type,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const updatedConversation = await Conversation.findById(conversationId)
      .populate("messages")
      .populate("participants");

    const onlineParticipants = updatedConversation.participants.filter(
      (p) => p.status === "Online" && p.socketId
    );

    onlineParticipants.forEach((participant) => {
      io.to(participant.socketId).emit("new-direct-chat", {
        conversationId,
        message: newMessage,
      });
    });
  } catch (error) {
    socket.emit("error", { message: "Failed to send message" });
  }
};

export default newMessageHandler;
