import mongoose from "mongoose";
import { model } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  lastMessage: { type: String },
  isSeenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},
  { timestamps: true }

);


const Conversation = model("Conversation", conversationSchema);

export default Conversation;
