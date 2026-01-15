import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RFP } from "../models/rfp.model.js";
import { aiService } from "../services/ai.service.js";
import {
  sendMessageSchema,
  updateRFPSchema,
  rfpIdSchema,
} from "../validators/rfp.validation.js";

// Send a chat message and get AI response
const chat = asyncHandler(async (req, res) => {
  console.log("=== CHAT ENDPOINT HIT ===");
  console.log("User:", req.user?._id);
  console.log("Body:", JSON.stringify(req.body));
  
  const validation = sendMessageSchema.safeParse(req.body);
  if (!validation.success) {
    console.log("Validation failed:", validation.error.errors[0].message);
    throw new ApiError(400, validation.error.errors[0].message);
  }

  const { message, rfpId } = validation.data;
  console.log("Message:", message, "RFP ID:", rfpId);
  let rfp;

  // Find or create RFP
  if (rfpId) {
    rfp = await RFP.findOne({ _id: rfpId, createdBy: req.user._id });
    if (!rfp) {
      throw new ApiError(404, "RFP not found");
    }
  } else {
    // Create new RFP in drafting status
    rfp = await RFP.create({
      createdBy: req.user._id,
      status: "drafting",
      chatHistory: [],
    });
  }

  // Add user message to history
  rfp.chatHistory.push({ role: "user", content: message });

  // Get AI response
  let aiResponse;
  try {
    console.log("Calling AI service with", rfp.chatHistory.length, "messages");
    aiResponse = await aiService.chat(rfp.chatHistory);
    console.log("AI response received:", aiResponse?.substring(0, 100) + "...");
  } catch (aiError) {
    console.error("AI Service Error:", aiError);
    throw new ApiError(500, `AI service error: ${aiError.message}`);
  }

  // Add AI response to history
  rfp.chatHistory.push({ role: "assistant", content: aiResponse });

  // Check if AI generated a complete RFP
  const parsedRFP = aiService.parseRFPFromResponse(aiResponse);
  if (parsedRFP) {
    rfp.title = parsedRFP.title;
    rfp.description = parsedRFP.description;
    rfp.requirements = parsedRFP.requirements || [];
    rfp.quantity = parsedRFP.quantity;
    rfp.budget = parsedRFP.budget;
    rfp.deadline = parsedRFP.deadline ? new Date(parsedRFP.deadline) : null;
    rfp.specs = parsedRFP.specs || {};
    rfp.isComplete = true;
    rfp.status = "draft";
  }

  await rfp.save();

  return res.status(200).json(
    new ApiResponse(200, {
      rfpId: rfp._id,
      message: aiResponse,
      isComplete: rfp.isComplete,
      rfp: rfp.isComplete ? {
        title: rfp.title,
        description: rfp.description,
        requirements: rfp.requirements,
        quantity: rfp.quantity,
        budget: rfp.budget,
        deadline: rfp.deadline,
        specs: rfp.specs,
      } : null,
    }, "Message processed")
  );
});

// Get all RFPs for user
const getRFPs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { createdBy: req.user._id };
  
  if (status) {
    query.status = status;
  }

  const rfps = await RFP.find(query)
    .populate("vendors", "name email company")
    .sort({ updatedAt: -1 })
    .select("-chatHistory");

  return res.status(200).json(
    new ApiResponse(200, rfps, "RFPs fetched successfully")
  );
});

// Get single RFP by ID
const getRFPById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validation = rfpIdSchema.safeParse({ id });
  if (!validation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  const rfp = await RFP.findOne({ _id: id, createdBy: req.user._id })
    .populate("vendors", "name email company");

  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  return res.status(200).json(
    new ApiResponse(200, rfp, "RFP fetched successfully")
  );
});

// Update RFP
const updateRFP = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idValidation = rfpIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  const validation = updateRFPSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, validation.error.errors[0].message);
  }

  const updateData = validation.data;
  if (updateData.deadline) {
    updateData.deadline = new Date(updateData.deadline);
  }

  const rfp = await RFP.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("vendors", "name email company");

  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  return res.status(200).json(
    new ApiResponse(200, rfp, "RFP updated successfully")
  );
});

// Delete RFP
const deleteRFP = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const validation = rfpIdSchema.safeParse({ id });
  if (!validation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  const rfp = await RFP.findOneAndDelete({ _id: id, createdBy: req.user._id });

  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "RFP deleted successfully")
  );
});

// Finalize RFP - mark as ready to send
const finalizeRFP = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const validation = rfpIdSchema.safeParse({ id });
  if (!validation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  const rfp = await RFP.findOne({ _id: id, createdBy: req.user._id });

  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  if (!rfp.isComplete) {
    throw new ApiError(400, "RFP is not complete. Continue chatting to gather all required information.");
  }

  if (!rfp.vendors || rfp.vendors.length === 0) {
    throw new ApiError(400, "Please select at least one vendor before finalizing");
  }

  rfp.status = "sent";
  await rfp.save();

  return res.status(200).json(
    new ApiResponse(200, rfp, "RFP finalized and ready to send")
  );
});

export { chat, getRFPs, getRFPById, updateRFP, deleteRFP, finalizeRFP };
