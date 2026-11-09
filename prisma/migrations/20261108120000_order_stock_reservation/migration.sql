-- AlterTable
ALTER TABLE "Order" ADD COLUMN "stockStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN "reservaExpiraEn" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_stockStatus_reservaExpiraEn_idx" ON "Order"("stockStatus", "reservaExpiraEn");

-- Los pedidos existentes quedan con stockStatus = NULL: siguen el flujo
-- anterior (el stock se descuenta cuando Wompi aprueba). Los ya aprobados
-- se marcan como vendidos para que nunca se vuelvan a descontar.
UPDATE "Order" SET "stockStatus" = 'COMMITTED' WHERE "status" = 'APPROVED';
