import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Proposal } from "../models/proposal.model.js";
import { RFP } from "../models/rfp.model.js";
import { Vendor } from "../models/vendor.model.js";
import {
  submitProposalSchema,
  updateProposalSchema,
  proposalIdSchema,
  rfpIdSchema,
} from "../validators/proposal.validation.js";

// Submit a proposal (public endpoint - vendor submits)
const submitProposal = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;
  
  console.log("Submit proposal request:", { rfpId, body: req.body });

  // Validate RFP ID
  const rfpValidation = rfpIdSchema.safeParse({ rfpId });
  if (!rfpValidation.success) {
    console.log("RFP ID validation failed:", rfpValidation.error);
    throw new ApiError(400, "Invalid RFP ID");
  }

  // Validate proposal data
  const validation = submitProposalSchema.safeParse(req.body);
  if (!validation.success) {
    console.log("Proposal validation failed:", validation.error.errors);
    throw new ApiError(400, validation.error.errors[0].message);
  }

  const data = validation.data;

  // Check RFP exists and is in "sent" status
  const rfp = await RFP.findById(rfpId);
  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }
  if (rfp.status !== "sent") {
    throw new ApiError(400, "This RFP is not accepting proposals");
  }

  // Find vendor by email
  let vendor = await Vendor.findOne({ email: data.vendorEmail.toLowerCase() });
  
  // If vendor doesn't exist, we still allow submission but won't link
  const vendorId = vendor?._id || null;

  // Check for duplicate proposal by email
  const existingProposal = await Proposal.findOne({ 
    rfp: rfpId, 
    vendorEmail: data.vendorEmail.toLowerCase() 
  });
  if (existingProposal) {
    throw new ApiError(400, "You have already submitted a proposal for this RFP");
  }

  // Parse delivery date if provided
  let deliveryDate = null;
  if (data.deliveryDate && data.deliveryDate.trim()) {
    deliveryDate = new Date(data.deliveryDate);
  }

  // Create proposal
  const proposal = await Proposal.create({
    rfp: rfpId,
    vendor: vendorId,
    vendorEmail: data.vendorEmail,
    vendorName: data.vendorName,
    price: data.price,
    timeline: data.timeline,
    deliveryDate: deliveryDate,
    terms: data.terms || "",
    notes: data.notes || "",
    status: "submitted",
  });

  console.log(`Proposal submitted for RFP ${rfpId} by ${data.vendorEmail}`);

  return res.status(201).json(
    new ApiResponse(201, proposal, "Proposal submitted successfully")
  );
});

// Get all proposals for an RFP (authenticated - RFP owner only)
const getProposalsForRFP = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;

  const rfpValidation = rfpIdSchema.safeParse({ rfpId });
  if (!rfpValidation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  // Verify RFP ownership
  const rfp = await RFP.findOne({ _id: rfpId, createdBy: req.user._id });
  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  const proposals = await Proposal.find({ rfp: rfpId })
    .populate("vendor", "name email company")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { rfp, proposals }, "Proposals fetched successfully")
  );
});

// Update proposal (status, score, notes)
const updateProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idValidation = proposalIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid Proposal ID");
  }

  const validation = updateProposalSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, validation.error.errors[0].message);
  }

  // Find proposal and verify RFP ownership
  const proposal = await Proposal.findById(id).populate("rfp");
  if (!proposal) {
    throw new ApiError(404, "Proposal not found");
  }

  if (proposal.rfp.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this proposal");
  }

  // Update fields
  const updateData = validation.data;
  Object.assign(proposal, updateData);
  await proposal.save();

  return res.status(200).json(
    new ApiResponse(200, proposal, "Proposal updated successfully")
  );
});

// Award proposal (mark as winner)
const awardProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idValidation = proposalIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid Proposal ID");
  }

  // Find proposal and verify RFP ownership
  const proposal = await Proposal.findById(id).populate("rfp");
  if (!proposal) {
    throw new ApiError(404, "Proposal not found");
  }

  if (proposal.rfp.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to award this proposal");
  }

  // Mark all other proposals as rejected
  await Proposal.updateMany(
    { rfp: proposal.rfp._id, _id: { $ne: id } },
    { status: "rejected" }
  );

  // Award this proposal
  proposal.status = "awarded";
  await proposal.save();

  // Update RFP status to closed
  await RFP.findByIdAndUpdate(proposal.rfp._id, { status: "closed" });

  return res.status(200).json(
    new ApiResponse(200, proposal, "Proposal awarded successfully")
  );
});

// Get RFP details for public proposal submission page
const getRFPForProposal = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;

  const rfpValidation = rfpIdSchema.safeParse({ rfpId });
  if (!rfpValidation.success) {
    throw new ApiError(400, "Invalid RFP ID");
  }

  const rfp = await RFP.findById(rfpId)
    .select("title description requirements quantity budget deadline specs status");

  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  if (rfp.status !== "sent") {
    throw new ApiError(400, "This RFP is not accepting proposals");
  }

  return res.status(200).json(
    new ApiResponse(200, rfp, "RFP fetched successfully")
  );
});

export { submitProposal, getProposalsForRFP, updateProposal, awardProposal, getRFPForProposal };
