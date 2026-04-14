import axios from "axios";
import { ApiError } from "../utils/ApiError";

interface GuperCustomerResponse {
  id: string;
}

export const findOrCreateGuperCustomer = async ({
  identifierType,
  identifierValue,
}: {
  identifierType: "phone" | "email" | "document";
  identifierValue: string;
}): Promise<GuperCustomerResponse> => {
  const baseURL = process.env.GUPER_BASE_URL;
  const apiKey = process.env.GUPER_API_KEY;  
  if (!baseURL || !apiKey) {
    throw new ApiError(500, "Guper configuration missing");
  }

  try {

    const findRes = await axios.post(
      `${baseURL}/find-customer`,
      {
        [identifierType]: identifierValue,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (findRes.data?.id) {
      return findRes.data;
    }

    const createRes = await axios.post(
      `${baseURL}/create-customer`,
      {
        [identifierType]: identifierValue,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!createRes.data?.id) {
      throw new ApiError(502, "Invalid response from GUPER create API");
    }

    return createRes.data;
  } catch (error: any) {
    // 🔥 Normalize external API errors
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "GUPER request failed";

    const statusCode = error?.response?.status || 502;

    throw new ApiError(statusCode, message);
  }
};