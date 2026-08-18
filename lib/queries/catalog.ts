import "server-only";
import { cache } from "react";
import type { Product, Category } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  PublicProduct,
  PublicCategory,
  PublicColor,
  ProductTipo,
} from "@/lib/public-product";

type ProductWithCategory = Product & {
  category: { slug: string; nombre: string };
};

function mapProduct(p: ProductWithCategory): PublicProduct {
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precioCop: p.precioCop,
    precioOfertaCop: p.precioOfertaCop,
    tipo: p.tipo,
    categoria: { slug: p.category.slug, nombre: p.category.nombre },
    rating: p.rating,
    reviews: p.reviews,
    nuevo: p.nuevo,
    colores: (p.colores as unknown as PublicColor[]) ?? [],
    features: (p.features as unknown as string[]) ?? [],
    imagenes: (p.imagenes as unknown as string[]) ?? [],
    videos: (p.videos as unknown as string[]) ?? [],
  };
}

/** Productos activos (con su categoría). Dedup por request con React cache. */
export const getPublicProducts = cache(async (): Promise<PublicProduct[]> => {
  const rows = await prisma.product.findMany({
    where: { activo: true },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { slug: true, nombre: true } } },
  });
  return rows.map(mapProduct);
});

/** Productos activos de un tipo ("peluca" | "lente"): un catálogo por tipo. */
export const getPublicProductsByTipo = cache(
  async (tipo: ProductTipo): Promise<PublicProduct[]> => {
    const rows = await prisma.product.findMany({
      where: { activo: true, tipo },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { slug: true, nombre: true } } },
    });
    return rows.map(mapProduct);
  },
);

export const getPublicProductBySlug = cache(
  async (slug: string): Promise<PublicProduct | null> => {
    const p = await prisma.product.findFirst({
      where: { slug, activo: true },
      include: { category: { select: { slug: true, nombre: true } } },
    });
    return p ? mapProduct(p) : null;
  },
);

export const getAllProductSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    where: { activo: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
});

export const getPublicCategories = cache(
  async (): Promise<PublicCategory[]> => {
    const rows: Pick<Category, "id" | "slug" | "nombre" | "imagen">[] =
      await prisma.category.findMany({
        where: { activa: true },
        orderBy: { orden: "asc" },
        select: { id: true, slug: true, nombre: true, imagen: true },
      });
    return rows;
  },
);

/**
 * Categorías que tienen al menos un producto activo del tipo dado. Así cada
 * catálogo muestra solo sus propios filtros sin necesidad de marcar el tipo
 * en la categoría (el tipo vive en el producto).
 */
export const getPublicCategoriesByTipo = cache(
  async (tipo: ProductTipo): Promise<PublicCategory[]> => {
    const rows: Pick<Category, "id" | "slug" | "nombre" | "imagen">[] =
      await prisma.category.findMany({
        where: { activa: true, products: { some: { activo: true, tipo } } },
        orderBy: { orden: "asc" },
        select: { id: true, slug: true, nombre: true, imagen: true },
      });
    return rows;
  },
);
