-- Migración faltante en el historial: esta columna se agregó directo a la
-- base de datos (fuera del flujo de migraciones) antes de que existiera
-- `ProductType`. La migración siguiente (`product_types`) ya asumía que
-- "tipo" existía —la usa para repartir categorías por tipo y luego la
-- elimina— pero ninguna migración anterior la había creado, así que
-- reconstruir la base desde cero (shadow db, un clon nuevo, CI) fallaba con
-- "column p.tipo does not exist". Se recupera aquí la definición original
-- (ver git history de schema.prisma) solo para que el historial sea
-- reproducible; en la base real esta migración se marca como ya aplicada
-- sin ejecutarse, porque esa base ya pasó por este estado.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'peluca';
