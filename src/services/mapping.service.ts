import { ApiError } from "../utils/ApiError";

interface SaveCustomerMappingInput {
  shop: string;
  shopifyCustomerId: string;
  identifierType: string;
  identifierValue: string;
  guperCustomerId: string;
}

export const saveCustomerMapping = async (
  data: SaveCustomerMappingInput
): Promise<boolean> => {
  const {
    shop,
    shopifyCustomerId,
    identifierType,
    identifierValue,
    guperCustomerId,
  } = data;

  // ✅ Basic validation (defensive, even if controller validates)
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
    // 🚧 TEMP: Replace with DB logic (Prisma / Mongo / SQL)
    console.log("Saving mapping:", {
      shop,
      shopifyCustomerId,
      identifierType,
      identifierValue,
      guperCustomerId,
    });

    // Simulate success
    return true;
  } catch (error: any) {
    // 🔥 Always normalize errors
    throw new ApiError(
      500,
      error.message || "Failed to save customer mapping"
    );
  }
};