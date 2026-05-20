import { Router } from "express";
import {
  verifyCredentials,
  saveCredentials,
  getMerchantStatus,
  getMerchantCustomers,
  getMerchantStats,
} from "../controller/merchant.controller";
import { validateBody } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/verify",
  validateBody(["account", "apiKey", "apiSecret"]),
  verifyCredentials
);

router.post(
  "/save",
  validateBody(["shop", "account", "apiKey", "apiSecret"]),
  saveCredentials
);

router.get("/status/:shop", getMerchantStatus);
router.get("/customers/:shop", getMerchantCustomers);
router.get("/stats/:shop", getMerchantStats);

export default router;