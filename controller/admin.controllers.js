import { asyncHandler } from "../utils/asyncHandle.js";
import { apiResponse } from "../utils/apiResponse.js";
import Message from "../models/message.models.js";

export const getFlaggedMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ flagged: true })
    .populate("author", "name email")
    .populate("receiver", "name email");

  return res.status(200).json(
    new apiResponse(200, messages, "Flagged messages retrieved successfully")
  );
});
