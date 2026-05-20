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
       customerName,      
      customerPhone,
    } = req.body;

    if (!shop || !shopifyCustomerId || !identifierType || !identifierValue) {
      throw new ApiError(400, "All fields required: shop, shopifyCustomerId, identifierType, identifierValue");
    }

    const guperCustomer = await findOrCreateGuperCustomer(
      shop,
      identifierType,
      identifierValue,
      customerName,     
      customerPhone,    
    );

    if (!guperCustomer?.id) {
      throw new ApiError(500, "Failed to find or create Guper customer");
    }

 await saveCustomerMapping({
  shop,
  shopifyCustomerId,
  identifierType,
  identifierValue,
  guperCustomerId: guperCustomer.id,
  customerName,                              
  customerEmail: identifierType === "email"
    ? identifierValue
    : undefined,                             
  customerPhone,                             
});
    return res.json({
      success: true,
      message: "GUPER account connected successfully",
      data: {
        guperCustomerId: guperCustomer.id,
        identifierType,
        identifierValue,
      },
    });
  }
);