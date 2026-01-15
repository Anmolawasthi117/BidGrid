import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  submitProposal,
  getProposalsForRFP,
  updateProposal,
  awardProposal,
  getRFPForProposal,
} from "../controllers/proposal.controller.js";

const router = Router();

// Public routes (for vendors to submit proposals)
router.route("/rfp/:rfpId").get(getRFPForProposal); // Get RFP details for submission
router.route("/rfp/:rfpId/submit").post(submitProposal); // Submit proposal

// Protected routes (for RFP owners)
router.use(verifyJWT);

router.route("/:id").patch(updateProposal); // Update proposal status/score
router.route("/:id/award").post(awardProposal); // Award proposal

export default router;
