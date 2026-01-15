import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  ingestEmails,
  getRecommendation,
  getProposalsWithAnalysis,
} from "../controllers/ingestion.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Ingest emails for an RFP
router.route("/:rfpId/ingest").post(ingestEmails);

// Get AI recommendation for an RFP
router.route("/:rfpId/recommendation").get(getRecommendation);

// Get proposals with analysis
router.route("/:rfpId/proposals-analysis").get(getProposalsWithAnalysis);

export default router;
