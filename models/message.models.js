import mongoose from "mongoose";
import { model } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    type: { type: String, enum: ["Text", "Media", "Document"], default: "Text" },
    document: Object,
    media: Object,
    flagged: { type: Boolean, default: false },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isInitial: { type: Boolean, default: false }
  },
  { timestamps: true }

);

const Message = model("Message", messageSchema);

export default Message;
