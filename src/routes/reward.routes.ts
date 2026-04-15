import { Router } from "express";
import { awardPoints, confirmOrderPoints } from "../controller/reward.controller";

const router = Router();

// Step 1: Calculate reward
router.post("/award", awardPoints);

// Step 2: Confirm order → Points credit
router.post("/confirm", confirmOrderPoints);

export default router;