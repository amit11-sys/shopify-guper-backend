import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

interface SaveCustomerMappingInput {
  shop: string;
  shopifyCustomerId: string;
  identifierType: string;
  identifierValue: string;
  guperCustomerId: number;       
}

export const saveCustomerMapping = async (
  data: SaveCustomerMappingInput
) => {
  const {
    shop,
    shopifyCustomerId,
    identifierType,
    identifierValue,
    guperCustomerId,
  } = data;

  if (
    !shop ||
    !shopifyCustomerId ||
    !identifierType ||
    !identifierValue ||
    !guperCustomerId
  ) {
    throw new ApiError(400, "Invalid mapping data");
  }

  try {
    const mapping = await prisma.customerMapping.upsert({
      where: {
        shop_shopifyCustomerId: {
          shop,
          shopifyCustomerId,
        },
      },
      update: {
        guperCustomerId,
        identifierType,
        identifierValue,
      },
      create: {
        shop,
        shopifyCustomerId,
        guperCustomerId,
        identifierType,
        identifierValue,
      },
    });

    console.log("✅ Customer mapping saved/updated:", {
      shop,
      shopifyCustomerId,
      guperCustomerId,
    });

    return mapping;           
  } catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to save customer mapping";
  throw new ApiError(500, message);
}
};

export const getCustomerMapping = async (
  shop: string,
  shopifyCustomerId: string
) => {
  if (!shop || !shopifyCustomerId) return null;

  try {
    return await prisma.customerMapping.findUnique({
      where: {
        shop_shopifyCustomerId: {
          shop,
          shopifyCustomerId,
        },
      },
    });
  } catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to save customer mapping";
  throw new ApiError(500, message);
}
};