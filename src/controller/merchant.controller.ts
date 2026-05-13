import { Request, Response, NextFunction } from "express";
import { verifyGuperCredentials } from "../services/guper.service";
import {
  saveMerchantCredentials,
  getMerchantByShop,
} from "../services/merchant.service";
import { getCustomersByShop } from "../services/mapping.service";
import prisma from "../utils/prisma";

// ─── Verify Credentials ───────────────────────────────
export const verifyCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { account, apiKey, apiSecret } = req.body;

    const result = await verifyGuperCredentials(account, apiKey, apiSecret);

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
  } catch (error: unknown) {
    next(error);
  }
};

// ─── Save Credentials ─────────────────────────────────
export const saveCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, account, apiKey, apiSecret } = req.body;

    const result = await verifyGuperCredentials(account, apiKey, apiSecret);

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
  } catch (error: unknown) {
    next(error);
  }
};

// ─── Merchant Status ──────────────────────────────────
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
  } catch (error: unknown) {
    next(error);
  }
};

// ─── Merchant Customers ───────────────────────────────
export const getMerchantCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shop = req.params.shop as string;  // ← as string add

    const customers = await getCustomersByShop(shop);

    res.status(200).json({
      success: true,
      data: {
        shop,
        totalCustomers: customers.length,
        customers,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

// ─── Merchant Stats ───────────────────────────────────
export const getMerchantStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shop = req.params.shop as string;  // ← as string add

    const totalCustomers = await prisma.customerMapping.count({
      where: { shop },
    });

    const totalOrders = await prisma.order.count({
      where: { shop, status: "CONFIRMED" },
    });

    const pointsData = await prisma.order.aggregate({
      where: { shop, status: "CONFIRMED" },
      _sum: { cashbackAmount: true },
    });

    const totalRedemptions = await prisma.redemption.count({
      where: { shop, status: "SUCCESS" },
    });

    const totalRefunds = await prisma.order.count({
      where: { shop, status: "REFUNDED" },
    });

    res.status(200).json({
      success: true,
      data: {
        shop,
        totalCustomers,
        totalOrders,
        totalPointsAwarded: pointsData._sum?.cashbackAmount || 0,  // ← ?. add
        totalRedemptions,
        totalRefunds,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};