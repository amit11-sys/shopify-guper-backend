import { Router } from "express";
import {
  verifyCredentials,
  saveCredentials,
  getMerchantStatus,
} from "../controller/merchant.controller";
import { validateBody } from "../middlewares/validate.middleware";

const router = Router();

// POST /api/merchant/verify
router.post(
  "/verify",
  validateBody(["account", "apiKey", "apiSecret"]),
  verifyCredentials
);

// POST /api/merchant/save
router.post(
  "/save",
  validateBody(["shop", "account", "apiKey", "apiSecret"]),
  saveCredentials
);

// GET /api/merchant/status/:shop
router.get("/status/:shop", getMerchantStatus);

export default router;