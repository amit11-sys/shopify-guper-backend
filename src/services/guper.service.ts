import axios from "axios";
import { getMerchantByShop } from "./merchant.service";

// ─── Interfaces ───────────────────────────────────────
interface TokenResult {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    expiresIn: string;
  };
}

interface GuperClient {
  id: string;
  email: string;
  name: string;
}

interface GuperItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface GuperCustomerPayload {
  entityType: string;
  name: string;
  email?: string;
  cellphone?: string;
  document?: string;
}

interface GuperCustomer {
  id: number;
  name: string;
  email?: string;
  cellphone?: string;
  document?: string;
}
interface RewardData {
  customerId: number;
  confirmToken: string;
  cashback: {
    thisOrder: {
      redeemable: { total: number; item: unknown[] };
      accumulating: {
        total: number;
        points: number;
        item: unknown[];
      };
    };
    userBalance: {
      total: number;
      availableAmount: number;
      points: number;
    };
  };
}

interface RewardResult {
  success: boolean;
  message?: string;
  data?: RewardData;
}
// ─── Base URL ─────────────────────────────────────────
const getBaseUrl = (account: string): string =>
  `https://${account}.myguper.com/api`;

// ─── Verify Credentials ───────────────────────────────
export const verifyGuperCredentials = async (
  account: string,
  apiKey: string,
  apiSecret: string
): Promise<TokenResult> => {
  try {
    const response = await axios.get(
      `${getBaseUrl(account)}/connect/token`,
      {
        headers: {
          "x-guper-apikey": apiKey,
          "x-guper-apisecret": apiSecret,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: {
        accessToken: response.data.accessToken,
        expiresIn: response.data.expiresIn,
      },
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error?.response?.status;
      const message = error?.response?.data?.reason_phrase;

      if (status === 401) {
        return { success: false, message: "Invalid API Key or API Secret" };
      }

      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        return { success: false, message: "Invalid Guper account name" };
      }

      return {
        success: false,
        message: message || error.message || "Unknown error",
      };
    }
    return { success: false, message: "Unknown error occurred" };
  }
};

// ─── Get Fresh Token ──────────────────────────────────
export const getFreshToken = async (
  shop: string
): Promise<{ accessToken: string; account: string }> => {
  const merchant = await getMerchantByShop(shop);

  if (!merchant) {
    throw new Error(`Merchant not found: ${shop}`);
  }

  if (!merchant.isActive) {
    throw new Error(`Merchant is inactive: ${shop}`);
  }

  const result = await verifyGuperCredentials(
    merchant.account,
    merchant.apiKey,
    merchant.apiSecret
  );

  if (!result.success || !result.data) {
    throw new Error(result.message || "Failed to generate token");
  }

  return {
    accessToken: result.data.accessToken,
    account: merchant.account,
  };
};

// ─── Reward By Order ──────────────────────────────────
// ─── Reward By Order ──────────────────────────────────
export const rewardByOrder = async (
  shop: string,
  client: GuperClient,
  items: GuperItem[]
): Promise<RewardResult> => {        // ← unknown se RewardResult
  const { accessToken, account } = await getFreshToken(shop);

  try {
    const response = await axios.post(
      `${getBaseUrl(account)}/loyalty/rewardByOrder`,
      {
        interface: "shopify",
        storeId: "1",
        client,
        items,
      },
      {
        headers: {
          "x-guper-authorization": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error?.response?.data || error.message,
      };
    }
    return { success: false, message: "Unknown error occurred" };
  }
};

// ─── Confirm Order ────────────────────────────────────
interface ConfirmData {
  TID: string;
  cashback: {
    redeemedOrder: number;
    accumulatedOrder: number;
  };
}

interface ConfirmResult {
  success: boolean;
  message?: string;
  data?: ConfirmData;
}

export const confirmOrder = async (
  shop: string,
  confirmToken: string,
  orderId: string
): Promise<ConfirmResult> => {       // ← unknown se ConfirmResult
  const { accessToken, account } = await getFreshToken(shop);

  try {
    const response = await axios.post(
      `${getBaseUrl(account)}/loyalty/confirmOrder/${confirmToken}`,
      { id: orderId },
      {
        headers: {
          "x-guper-authorization": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error?.response?.data || error.message,
      };
    }
    return { success: false, message: "Unknown error occurred" };
  }
};

// ─── Find or Create Customer ──────────────────────────
export const findOrCreateGuperCustomer = async (
  shop: string,
  identifierType: string,
  identifierValue: string,
  customerName?: string,
  customerPhone?: string
): Promise<GuperCustomer> => {
  const { accessToken, account } = await getFreshToken(shop);

  const payload: GuperCustomerPayload = {
    entityType: "individual",
    name: customerName || "Guest User",
  };

  if (identifierType === "email") {
    payload.email = identifierValue;
    if (customerPhone) {
      payload.cellphone = customerPhone;
    }
  }

  if (identifierType === "cellphone") {
    payload.cellphone = identifierValue;
  }

  if (identifierType === "document") {
    payload.document = identifierValue;
  }

  console.log("=== GUPER CUSTOMER DEBUG ===");
  console.log("URL:", `${getBaseUrl(account)}/register/customer`);
  console.log("Payload:", JSON.stringify(payload));
  console.log("============================");

  try {
    const response = await axios.post<GuperCustomer>(
      `${getBaseUrl(account)}/register/customer`,
      payload,
      {
        headers: {
          "x-guper-authorization": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Customer:", response.data);
    return response.data;                          // ✅ Success return

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.log("❌ Status:", error?.response?.status);
      console.log("❌ Data:", JSON.stringify(error?.response?.data));

      const message =
        error?.response?.data?.reason_phrase ||
        error?.response?.data?.message ||
        "Failed to find/create Guper customer";

      throw new Error(message, { cause: error });  // ✅ cause added
    }
    throw new Error("Failed to find/create Guper customer", { cause: error }); // ✅ cause added
  }
};