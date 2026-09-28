-- AlterTable
ALTER TABLE "Product" ADD COLUMN "masVendido" BOOLEAN NOT NULL DEFAULT false;

-- Antes "Lo más vendido" se calculaba solo (no nuevos, activos, con stock,
-- ordenados por reseñas/rating). Se marcan esos mismos productos para
-- conservar lo que hoy muestra el Home; desde aquí el admin decide.
UPDATE "Product" SET "masVendido" = true
WHERE "id" IN (
  SELECT "id" FROM "Product"
  WHERE "nuevo" = false AND "activo" = true AND "stock" > 0
  ORDER BY "reviews" DESC, "rating" DESC
  LIMIT 12
);
