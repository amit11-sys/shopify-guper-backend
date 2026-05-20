import { Request, Response, NextFunction } from "express";
import { rewardByOrder, confirmOrder } from "../services/guper.service";
import {
  createOrder,
  confirmOrderInDB,
  getOrderByShopifyId,
} from "../services/order.service";

// ─── Award Points ─────────────────────────────────────
export const awardPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, orderId, client, items } = req.body;

    if (!shop || !orderId || !client || !items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: shop, orderId, client, items",
      });
      return;
    }

    const existingOrder = await getOrderByShopifyId(orderId);
    if (existingOrder) {
      res.status(409).json({
        success: false,
        message: "Order already processed",
        data: {
          orderId: existingOrder.shopifyOrderId,
          status: existingOrder.status,
        },
      });
      return;
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const result = await rewardByOrder(shop, client, items);

    // ✅ result.data check
    if (!result.success || !result.data) {
      res.status(400).json({
        success: false,
        message: result.message || "Failed to calculate reward",
      });
      return;
    }

    // ✅ Ab result.data safely use karo
    const rewardData = result.data;

    const order = await createOrder(
      shop,
      orderId,
      client.email,
      client.name,
      totalAmount,
      rewardData.cashback.thisOrder.accumulating.total,
      rewardData.customerId,
      rewardData.confirmToken
    );

    res.status(200).json({
      success: true,
      message: "Reward calculated and order saved",
      data: {
        orderId: order.shopifyOrderId,
        customerId: rewardData.customerId,
        cashback: rewardData.cashback,
        confirmToken: rewardData.confirmToken,
        status: order.status,
      },
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to calculate reward",
      });
      return;
    }
    next(error);
  }
};

// ─── Confirm Order ────────────────────────────────────
export const confirmOrderPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shop, confirmToken, orderId } = req.body;

    if (!shop || !confirmToken || !orderId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: shop, confirmToken, orderId",
      });
      return;
    }

    const result = await confirmOrder(shop, confirmToken, orderId);

    // ✅ result.data check
    if (!result.success || !result.data) {
      res.status(400).json({
        success: false,
        message: result.message || "Failed to confirm order",
      });
      return;
    }

    // ✅ Ab result.data safely use karo
    const confirmData = result.data;

    const order = await confirmOrderInDB(
      orderId,
      confirmData.TID
    );

    res.status(200).json({
      success: true,
      message: "Order confirmed. Points credited!",
      data: {
        orderId: order.shopifyOrderId,
        status: order.status,
        cashback: confirmData.cashback,
      },
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to confirm order",
      });
      return;
    }
    next(error);
  }
};