import { Router } from "express";
import { healthcheack } from "../controllers/healthcheack.controller.js";

const router = Router();

router.route("/").get(healthcheack);

export default router