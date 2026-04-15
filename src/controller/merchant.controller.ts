import { Request, Response, NextFunction } from "express";
import { verifyGuperCredentials } from "../services/guper.service";
import { saveMerchantCredentials, getMerchantByShop } from "../services/merchant.service";


export const verifyCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { account, apiKey, apiSecret } = req.body;

    const result = await verifyGuperCredentials(
      account,
      apiKey,
      apiSecret
    );

    if (!result.success) {
      res.status(401).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Guper credentials verified successfully",
      data: {
        account: account,
        accessToken: result.data?.accessToken,
        expiresIn: result.data?.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const saveCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, account, apiKey, apiSecret } = req.body;


    const result = await verifyGuperCredentials(
      account,
      apiKey,
      apiSecret
    );

    if (!result.success) {
      res.status(401).json({
        success: false,
        message: result.message,
      });
      return;
    }

   
    const merchant = await saveMerchantCredentials(
      shop,
      account,
      apiKey,
      apiSecret,
      result.data!.accessToken,
      result.data!.expiresIn
    );

    res.status(200).json({
      success: true,
      message: "Credentials verified and saved successfully",
      data: {
        shop: merchant.shop,
        account: merchant.account,
        isActive: merchant.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getMerchantStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shop = req.params.shop as string;

    const merchant = await getMerchantByShop(shop);

    if (!merchant) {
      res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        shop: merchant.shop,
        account: merchant.account,
        isActive: merchant.isActive,
        createdAt: merchant.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};