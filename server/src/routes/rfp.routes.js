import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  chat,
  getRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  finalizeRFP,
} from "../controllers/rfp.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Chat endpoint for AI conversation
router.route("/chat").post(chat);

// CRUD routes
router.route("/")
  .get(getRFPs);

router.route("/:id")
  .get(getRFPById)
  .patch(updateRFP)
  .delete(deleteRFP);

// Finalize RFP (mark as sent)
router.route("/:id/finalize").post(finalizeRFP);

export default router;
