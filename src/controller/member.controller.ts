import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { findOrCreateGuperCustomer } from "../services/guper.service";
import { saveCustomerMapping } from "../services/mapping.service";

export const connectMember = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      shop,
      shopifyCustomerId,
      identifierType,
      identifierValue,
    } = req.body;

    if (!identifierValue || !identifierType) {
      throw new ApiError(400, "Identifier required");
    }

    if (!shop || !shopifyCustomerId) {
      throw new ApiError(400, "Shop or customer missing");
    }

    const guperCustomer = await findOrCreateGuperCustomer({
      identifierType,
      identifierValue,
    });

    if (!guperCustomer?.id) {
      throw new ApiError(500, "Failed to create/find GUPER customer");
    }

    await saveCustomerMapping({
      shop,
      shopifyCustomerId,
      identifierType,
      identifierValue,
      guperCustomerId: guperCustomer.id,
    });

    return res.json({
      success: true,
      message: "GUPER account connected",
    });
  }
);