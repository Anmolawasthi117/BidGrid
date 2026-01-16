import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RFP } from "../models/rfp.model.js";
import { Proposal } from "../models/proposal.model.js";
import { Vendor } from "../models/vendor.model.js";
import { emailIngestionService } from "../services/emailIngestion.service.js";
import { pdfParserService } from "../services/pdfParser.service.js";
import { aiService } from "../services/ai.service.js";
import { vendorRecommendationService } from "../services/vendorRecommendation.service.js";

// Ingest emails for an RFP
const ingestEmails = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;

  // Verify RFP ownership
  const rfp = await RFP.findOne({ _id: rfpId, createdBy: req.user._id })
    .populate("vendors");
  
  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  console.log(`Starting email ingestion for RFP: ${rfp.title}`);

  // Fetch matching emails
  const emails = await emailIngestionService.ingestEmailsForRFP(rfpId, req.user._id);
  
  if (emails.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { processed: 0, proposals: [] }, "No new vendor emails found")
    );
  }

  const processedProposals = [];

  for (const email of emails) {
    try {
      // Check if proposal already exists for this vendor
      const existingProposal = await Proposal.findOne({
        rfp: rfpId,
        vendorEmail: email.fromAddress.toLowerCase(),
      });

      if (existingProposal) {
        console.log(`Proposal already exists for ${email.fromAddress}`);
        continue;
      }

      // Extract text from PDF attachments
      const pdfResults = await pdfParserService.extractFromAttachments(email.attachments);
      const allText = pdfParserService.combineAllText(email.text || email.html, pdfResults);

      // Use AI to parse the email content
      console.log(`Parsing email from ${email.fromAddress} with AI...`);
      const parsedData = await aiService.parseVendorResponse(allText, {
        title: rfp.title,
        description: rfp.description,
        requirements: rfp.requirements,
        budget: rfp.budget,
        quantity: rfp.quantity,
      });

      // Find vendor in system
      const vendor = await Vendor.findOne({ 
        email: email.fromAddress.toLowerCase(),
        createdBy: req.user._id 
      });

      // Create proposal from parsed data
      const proposal = await Proposal.create({
        rfp: rfpId,
        vendor: vendor?._id || null,
        vendorEmail: email.fromAddress.toLowerCase(),
        vendorName: parsedData?.vendorName || email.from || "Unknown Vendor",
        source: "email",
        originalEmail: email.text || email.html,
        emailSubject: email.subject,
        attachmentTexts: pdfResults.map(p => p.text).filter(Boolean),
        parsedData: parsedData || {},
        price: parsedData?.price || { amount: 0, currency: "USD" },
        timeline: parsedData?.timeline || "",
        terms: parsedData?.terms || [],
        completeness: parsedData?.completeness || 0,
        aiScore: parsedData?.completeness || 0, // Use completeness as initial score
        aiAnalysis: parsedData?.summary || "",
        status: "parsed",
      });

      processedProposals.push(proposal);

      // Mark email as read
      await emailIngestionService.markAsRead(email.uid);
      console.log(`Created proposal from ${email.fromAddress}`);
    } catch (err) {
      console.error(`Error processing email from ${email.fromAddress}:`, err.message);
    }
  }

  // Disconnect from IMAP
  await emailIngestionService.disconnect();

  return res.status(200).json(
    new ApiResponse(200, {
      processed: processedProposals.length,
      total: emails.length,
      proposals: processedProposals,
    }, `Processed ${processedProposals.length} new proposals from emails`)
  );
});

// Get AI recommendation for an RFP
const getRecommendation = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;

  // Verify RFP ownership
  const rfp = await RFP.findOne({ _id: rfpId, createdBy: req.user._id });
  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  // Get all proposals for this RFP
  const proposals = await Proposal.find({ rfp: rfpId });

  if (proposals.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { 
        recommendation: null,
        message: "No proposals to analyze" 
      }, "No proposals found")
    );
  }

  console.log(`Generating AI recommendation for ${proposals.length} proposals...`);

  // Generate quick comparison
  const quickComparison = vendorRecommendationService.generateQuickComparison(proposals);

  // Generate full AI recommendation
  const recommendation = await vendorRecommendationService.generateRecommendation(
    proposals,
    {
      title: rfp.title,
      description: rfp.description,
      requirements: rfp.requirements,
      budget: rfp.budget,
      quantity: rfp.quantity,
    }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      rfp: {
        _id: rfp._id,
        title: rfp.title,
        status: rfp.status,
      },
      proposalCount: proposals.length,
      quickComparison,
      recommendation,
    }, "Recommendation generated successfully")
  );
});

// Get proposals with parsed data for an RFP
const getProposalsWithAnalysis = asyncHandler(async (req, res) => {
  const { rfpId } = req.params;

  // Verify RFP ownership
  const rfp = await RFP.findOne({ _id: rfpId, createdBy: req.user._id });
  if (!rfp) {
    throw new ApiError(404, "RFP not found");
  }

  const proposals = await Proposal.find({ rfp: rfpId })
    .populate("vendor", "name email company")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, {
      rfp,
      proposals,
    }, "Proposals fetched successfully")
  );
});

export { ingestEmails, getRecommendation, getProposalsWithAnalysis };
