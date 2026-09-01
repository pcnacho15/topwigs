-- AlterTable
ALTER TABLE "Category" ADD COLUMN "destacada" BOOLEAN NOT NULL DEFAULT false;

-- Las categorías que ya existían se mostraban todas en el Home: se marcan como
-- destacadas para conservar el estado actual. Las nuevas nacen en false y el
-- admin decide si las destaca.
UPDATE "Category" SET "destacada" = true;
