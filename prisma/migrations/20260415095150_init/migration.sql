-- CreateTable
CREATE TABLE "customer_mappings" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "guperCustomerId" INTEGER NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_mappings_shop_idx" ON "customer_mappings"("shop");

-- CreateIndex
CREATE INDEX "customer_mappings_guperCustomerId_idx" ON "customer_mappings"("guperCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_mappings_shop_shopifyCustomerId_key" ON "customer_mappings"("shop", "shopifyCustomerId");

-- CreateIndex
CREATE INDEX "orders_shop_status_idx" ON "orders"("shop", "status");

-- AddForeignKey
ALTER TABLE "customer_mappings" ADD CONSTRAINT "customer_mappings_shop_fkey" FOREIGN KEY ("shop") REFERENCES "merchant_credentials"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;
