-- AlterTable
ALTER TABLE "Category" ADD COLUMN "resumen" TEXT NOT NULL DEFAULT '',
ADD COLUMN "caracteristicas" JSONB NOT NULL DEFAULT '[]';
