

import { Router } from "express";
import { getBalance, redeemPoints, refundOrder } from "../controller/loyalty.controller";

const router = Router();

router.get("/balance", getBalance);
router.post("/refund", refundOrder);
router.post("/redeem", redeemPoints);

export default router;