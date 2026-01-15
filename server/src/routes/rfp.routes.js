import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  chat,
  getRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  finalizeRFP,
  sendRFP,
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

// Send RFP to vendors via email
router.route("/:id/send").post(sendRFP);

export default router;
