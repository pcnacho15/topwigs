-- Migración de "catch-up": estas columnas ya existían en la base real (se
-- agregaron con `prisma db push` en distintos momentos: datos de envío y
-- correo en Order, oferta/stock/videos en Product, y más recientemente
-- Order.ivaCop) pero nunca quedaron registradas como migración. Generada
-- con `prisma migrate diff --from-migrations ./prisma/migrations --to-url
-- $DATABASE_URL --script` para que el historial reproduzca el estado real.
-- En la base real se marcó como ya aplicada (`migrate resolve --applied`)
-- sin ejecutarse, porque esa base ya está en este estado.

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "barrio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "departamento" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "direccion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emailSentStatus" TEXT,
ADD COLUMN     "indicaciones" TEXT,
ADD COLUMN     "ivaCop" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "municipio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingCop" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotalCop" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "precioOfertaCop" INTEGER,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videos" JSONB NOT NULL DEFAULT '[]';
