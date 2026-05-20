import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

interface SaveCustomerMappingInput {
  shop: string;
  shopifyCustomerId: string;
  identifierType: string;
  identifierValue: string;
  guperCustomerId: number;
  customerName?: string;     // ⭐ Add
  customerEmail?: string;    // ⭐ Add
  customerPhone?: string;    // ⭐ Add
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
    customerName,     // ⭐ Add
    customerEmail,    // ⭐ Add
    customerPhone,    // ⭐ Add
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
        customerName,     
        customerEmail,    
        customerPhone,   
      },
      create: {
        shop,
        shopifyCustomerId,
        guperCustomerId,
        identifierType,
        identifierValue,
        customerName,     
        customerEmail,   
        customerPhone,    
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
    const message = error instanceof Error ? error.message : "Failed to fetch customer mapping";
    throw new ApiError(500, message);
  }
};

export const getCustomersByShop = async (shop: string) => {
  return await prisma.customerMapping.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
};