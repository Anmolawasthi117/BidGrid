import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "../controllers/vendor.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// CRUD routes
router.route("/")
  .get(getVendors)
  .post(createVendor);

router.route("/:id")
  .get(getVendorById)
  .patch(updateVendor)
  .delete(deleteVendor);

export default router;
