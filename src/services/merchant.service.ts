import prisma from "../utils/prisma";


export const saveMerchantCredentials = async (
  shop: string,
  account: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  tokenExpiresAt: string
) => {
  const merchant = await prisma.merchantCredential.upsert({
    where: { shop },
    update: {
      account,
      apiKey,
      apiSecret,
      accessToken,
      tokenExpiresAt: new Date(tokenExpiresAt),
      isActive: true,
    },
    create: {
      shop,
      account,
      apiKey,
      apiSecret,
      accessToken,
      tokenExpiresAt: new Date(tokenExpiresAt),
      isActive: true,
    },
  });

  return merchant;
};


export const getMerchantByShop = async (shop: string) => {
  return await prisma.merchantCredential.findUnique({
    where: { shop },
  });
};