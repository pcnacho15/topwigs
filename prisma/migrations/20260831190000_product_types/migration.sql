-- El tipo de producto deja de estar hardcodeado ("peluca" | "lente") y pasa a
-- ser una tabla, para que el admin pueda crear catálogos nuevos con sus
-- propias categorías. El tipo de un producto pasa a vivir en su categoría.

-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_slug_key" ON "ProductType"("slug");

-- Los dos tipos que existían en el código pasan a ser filas. Los slugs se
-- conservan para no romper las URLs /pelucas y /lentes.
INSERT INTO "ProductType" ("id", "slug", "nombre", "label", "descripcion", "orden", "activo", "createdAt", "updatedAt")
VALUES
  ('pt_pelucas', 'pelucas', 'Peluca', 'Pelucas', 'Explora las pelucas TOPWIGS. Fibra seminatural, resistentes al calor.', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pt_lentes', 'lentes', 'Lente', 'Lentes', 'Lentes de contacto TOPWIGS. Cambia tu mirada, cambia tu vibra.', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: cada categoría queda bajo un tipo, deducido de sus productos.
ALTER TABLE "Category" ADD COLUMN "productTypeId" TEXT;

UPDATE "Category" SET "productTypeId" = 'pt_lentes'
WHERE EXISTS (
  SELECT 1 FROM "Product" p
  WHERE p."categoryId" = "Category"."id" AND p."tipo" = 'lente'
);

UPDATE "Category" SET "productTypeId" = 'pt_pelucas' WHERE "productTypeId" IS NULL;

ALTER TABLE "Category" ALTER COLUMN "productTypeId" SET NOT NULL;

-- El slug de categoría pasa a ser único por tipo, no global.
DROP INDEX "Category_slug_key";
CREATE UNIQUE INDEX "Category_productTypeId_slug_key" ON "Category"("productTypeId", "slug");
CREATE INDEX "Category_productTypeId_idx" ON "Category"("productTypeId");

-- AddForeignKey (RESTRICT: no se puede borrar un tipo que tenga categorías)
ALTER TABLE "Category" ADD CONSTRAINT "Category_productTypeId_fkey"
  FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- El tipo del producto ahora se lee de su categoría.
ALTER TABLE "Product" DROP COLUMN "tipo";
