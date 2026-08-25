import { PrismaClient, Prisma } from "@prisma/client";
import { CATEGORIAS } from "../data/categories";
import { WIGS } from "../data/products";

/** Los campos JSON tipados necesitan castearse al tipo de entrada de Prisma. */
const json = (v: unknown) => v as Prisma.InputJsonValue;

const prisma = new PrismaClient();

async function main() {
  // Categorías
  for (const [i, c] of CATEGORIAS.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre, orden: i },
      create: { slug: c.slug, nombre: c.nombre, orden: i },
    });
  }

  const categorias = await prisma.category.findMany();
  const idPorSlug = new Map(categorias.map((c) => [c.slug, c.id]));

  // Productos
  for (const w of WIGS) {
    const categoryId = idPorSlug.get(w.categoria);
    if (!categoryId) continue;
    const data = {
      nombre: w.nombre,
      descripcion: w.descripcion,
      precioCop: w.precio,
      tipo: "peluca",
      categoryId,
      rating: w.rating,
      reviews: w.reviews,
      nuevo: Boolean(w.nuevo),
      // Colores mock ({nombre,hex}) → nuevo shape (sólido).
      colores: json(
        w.colores.map((c) => ({
          nombre: c.nombre,
          tipo: "solid",
          from: c.hex,
          to: null,
          // El seed no carga media; se asigna desde el admin.
          imagenes: [],
          videos: [],
        })),
      ),
      features: json(w.features),
      imagenes: json([]),
      videos: json([]),
    };
    await prisma.product.upsert({
      where: { slug: w.slug },
      update: data,
      create: { slug: w.slug, ...data },
    });
  }

  console.log(
    `Seed completo: ${CATEGORIAS.length} categorías, ${WIGS.length} productos.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
