-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "guperCustomerId" INTEGER,
    "guperTID" TEXT,
    "confirmToken" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "orderAmount" INTEGER NOT NULL,
    "cashbackAmount" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyOrderId_key" ON "orders"("shopifyOrderId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_fkey" FOREIGN KEY ("shop") REFERENCES "merchant_credentials"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;
