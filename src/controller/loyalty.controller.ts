

import { Request, Response, NextFunction } from "express";
import {
  getCustomerBalance,
  cancelTransaction,
  rewardByOrder,
  redeemReserve,
    redeemSettle, 
} from "../services/guper.service";
import { getCustomerMapping } from "../services/mapping.service";
import prisma from "../utils/prisma";

// ─── Get Balance ──────────────────────────────────────
export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, shopifyCustomerId } = req.query;

    if (!shop || !shopifyCustomerId) {
      res.status(400).json({
        success: false,
        message: "Missing required: shop, shopifyCustomerId",
      });
      return;
    }

    const mapping = await getCustomerMapping(
      shop as string,
      shopifyCustomerId as string
    );

    if (!mapping) {
      res.status(404).json({
        success: false,
        message: "Customer not linked to Guper",
      });
      return;
    }

    const balance = await getCustomerBalance(
      shop as string,
      mapping.guperCustomerId
    );

    res.status(200).json({
      success: true,
      data: {
        shopifyCustomerId,
        guperCustomerId: mapping.guperCustomerId,
        total: balance.total,
        available: balance.available,
        expired: balance.expired,
        used: balance.used,
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

// ─── Refund Order ─────────────────────────────────────
export const refundOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, shopifyOrderId } = req.body;

    if (!shop || !shopifyOrderId) {
      res.status(400).json({
        success: false,
        message: "Missing required: shop, shopifyOrderId",
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { shopifyOrderId },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.status === "REFUNDED") {
      res.status(409).json({
        success: false,
        message: "Order already refunded",
      });
      return;
    }

    if (!order.guperTID) {
      res.status(400).json({
        success: false,
        message: "Order not confirmed yet - cannot refund",
      });
      return;
    }

    const result = await cancelTransaction(shop, order.guperTID);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    await prisma.order.update({
      where: { shopifyOrderId },
      data: { status: "REFUNDED" },
    });

    res.status(200).json({
      success: true,
      message: "Order refunded. Points reversed!",
      data: {
        orderId: order.shopifyOrderId,
        status: "REFUNDED",
        pointsReversed: order.cashbackAmount,
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


export const redeemPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, shopifyCustomerId, orderId, items } = req.body;

    if (!shop || !shopifyCustomerId || !orderId || !items) {
      res.status(400).json({
        success: false,
        message: "Missing required: shop, shopifyCustomerId, orderId, items",
      });
      return;
    }

   
    const mapping = await getCustomerMapping(shop, shopifyCustomerId);

    if (!mapping) {
      res.status(404).json({
        success: false,
        message: "Customer not linked to Guper",
      });
      return;
    }

    // 2. rewardByOrder call → confirmToken + redeemable
    const rewardResult = await rewardByOrder(
      shop,
      {
        id: String(mapping.guperCustomerId),
        email: mapping.identifierValue,
        name: mapping.customerName || "Customer",
      },
      items
    );

    if (!rewardResult.success || !rewardResult.data) {
      res.status(400).json({
        success: false,
        message: "Failed to calculate reward",
      });
      return;
    }

    const rewardData = rewardResult.data;
    const confirmToken = rewardData.confirmToken;
    const redeemableAmount = rewardData.cashback.thisOrder.redeemable.total;

    if (redeemableAmount <= 0) {
      res.status(400).json({
        success: false,
        message: "No redeemable points available",
      });
      return;
    }

    // 3. Redeem reserve
    const reserveResult = await redeemReserve(shop, confirmToken, orderId);

    if (!reserveResult.success) {
      res.status(400).json({
        success: false,
        message: reserveResult.message,
      });
      return;
    }

    // 4. Redeem settle
    const settleResult = await redeemSettle(shop, confirmToken);

    if (!settleResult.success) {
      res.status(400).json({
        success: false,
        message: settleResult.message,
      });
      return;
    }

   
    await prisma.redemption.create({
      data: {
        shop,
        customerId: mapping.id,
        guperCustomerId: mapping.guperCustomerId,
        pointsRedeemed: redeemableAmount,
        discountAmount: redeemableAmount,
        confirmToken,
        status: "SUCCESS",
      },
    });

    res.status(200).json({
      success: true,
      message: "Points redeemed successfully!",
      data: {
        shopifyCustomerId,
        pointsRedeemed: redeemableAmount,
        discountAmount: redeemableAmount,
        status: "SUCCESS",
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