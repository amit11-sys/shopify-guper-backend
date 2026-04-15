import prisma from "../utils/prisma";

// ─── Save Order After Reward Calculate ────────────────
export const createOrder = async (
  shop: string,
  shopifyOrderId: string,
  customerEmail: string,
  customerName: string,
  orderAmount: number,
  cashbackAmount: number,
  guperCustomerId: number,
  confirmToken: string
) => {
  return await prisma.order.create({
    data: {
      shop,
      shopifyOrderId,
      customerEmail,
      customerName,
      orderAmount,
      cashbackAmount,
      guperCustomerId,
      confirmToken,
      status: "PENDING",
    },
  });
};

// ─── Update Order After Confirm ───────────────────────
export const confirmOrderInDB = async (
  shopifyOrderId: string,    // ← confirmToken ki jagah shopifyOrderId
  guperTID: string
) => {
  return await prisma.order.update({
    where: { shopifyOrderId },  // ← ye unique hai
    data: {
      guperTID,
      status: "CONFIRMED",
    },
  });
};

// ─── Get Order By Shopify Order ID ────────────────────
export const getOrderByShopifyId = async (shopifyOrderId: string) => {
  return await prisma.order.findUnique({
    where: { shopifyOrderId },
  });
};

// ─── Get Orders By Shop ──────────────────────────────
export const getOrdersByShop = async (shop: string) => {
  return await prisma.order.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
};