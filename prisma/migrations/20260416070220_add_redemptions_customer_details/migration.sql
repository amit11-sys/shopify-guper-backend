-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "customer_mappings" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT;

-- CreateTable
CREATE TABLE "redemptions" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "guperCustomerId" INTEGER NOT NULL,
    "pointsRedeemed" INTEGER NOT NULL,
    "discountCode" TEXT,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "confirmToken" TEXT,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "redemptions_shop_idx" ON "redemptions"("shop");

-- CreateIndex
CREATE INDEX "redemptions_customerId_idx" ON "redemptions"("customerId");

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_shop_fkey" FOREIGN KEY ("shop") REFERENCES "merchant_credentials"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_mappings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
