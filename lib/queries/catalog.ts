import "server-only";
import { cache } from "react";
import type { Product, Category, ProductType } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  PublicProduct,
  PublicCategory,
  PublicCategoryConTipo,
  PublicColor,
  PublicProductType,
} from "@/lib/public-product";
import { catalogoHref } from "@/lib/public-product";

/** Campos del tipo que necesita la tienda (nunca el id interno). */
const TIPO_SELECT = {
  slug: true,
  nombre: true,
  label: true,
  descripcion: true,
} as const;

const CATEGORIA_SELECT = {
  slug: true,
  nombre: true,
  productType: { select: TIPO_SELECT },
} as const;

type ProductWithCategory = Product & {
  category: { slug: string; nombre: string; productType: PublicProductType };
};

type CategoryRow = Pick<Category, "id" | "slug" | "nombre" | "imagen"> & {
  productType: PublicProductType;
};

/**
 * Los colores guardados antes de que existiera la asignación de medios por
 * color no traen `imagenes`/`videos`: se normalizan a arrays vacíos. Además
 * se descartan URLs que ya no estén en la galería del producto (por si se
 * borró un archivo sin pasar por el formulario del admin).
 */
function normalizeColores(
  raw: unknown,
  imagenes: string[],
  videos: string[],
): PublicColor[] {
  if (!Array.isArray(raw)) return [];
  return (raw as PublicColor[]).map((c) => ({
    ...c,
    imagenes: (c.imagenes ?? []).filter((u) => imagenes.includes(u)),
    videos: (c.videos ?? []).filter((u) => videos.includes(u)),
  }));
}

function mapProduct(p: ProductWithCategory): PublicProduct {
  const imagenes = (p.imagenes as unknown as string[]) ?? [];
  const videos = (p.videos as unknown as string[]) ?? [];
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precioCop: p.precioCop,
    precioOfertaCop: p.precioOfertaCop,
    // El tipo lo define la categoría: un producto siempre está en el catálogo
    // de su categoría.
    tipo: p.category.productType,
    categoria: { slug: p.category.slug, nombre: p.category.nombre },
    rating: p.rating,
    reviews: p.reviews,
    nuevo: p.nuevo,
    agotado: !p.activo || p.stock <= 0,
    colores: normalizeColores(p.colores, imagenes, videos),
    features: (p.features as unknown as string[]) ?? [],
    tips: (p.tips as unknown as string[]) ?? [],
    imagenes,
    videos,
  };
}

function mapCategoria(c: CategoryRow): PublicCategoryConTipo {
  return {
    id: c.id,
    slug: c.slug,
    nombre: c.nombre,
    imagen: c.imagen,
    tipo: c.productType,
  };
}

// ─────────────── Catálogos (tipos de producto) ───────────────

/** Catálogos visibles en la tienda, en el orden que definió el admin. */
export const getCatalogos = cache(async (): Promise<PublicProductType[]> => {
  const rows: Pick<
    ProductType,
    "slug" | "nombre" | "label" | "descripcion"
  >[] = await prisma.productType.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    select: TIPO_SELECT,
  });
  return rows;
});

/** Un catálogo por su slug (la ruta pública). `null` si no existe o está oculto. */
export const getCatalogo = cache(
  async (slug: string): Promise<PublicProductType | null> => {
    const row = await prisma.productType.findFirst({
      where: { slug, activo: true },
      select: TIPO_SELECT,
    });
    return row;
  },
);

/**
 * Links de navegación: Inicio + un link por catálogo activo. Al vivir en la
 * base de datos, un tipo de producto nuevo aparece solo en navbar y footer.
 */
export const getNavLinks = cache(
  async (): Promise<{ href: string; label: string }[]> => {
    const catalogos = await getCatalogos();
    return [
      { href: "/", label: "Inicio" },
      ...catalogos.map((c) => ({ href: catalogoHref(c.slug), label: c.label })),
    ];
  },
);

// ─────────────── Productos ───────────────

/**
 * Todos los productos (con su categoría), incluidos los agotados o
 * desactivados: siguen siendo visibles en la tienda, solo marcados como
 * "agotado" (ver `mapProduct`). Dedup por request con React cache.
 */
export const getPublicProducts = cache(async (): Promise<PublicProduct[]> => {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: CATEGORIA_SELECT } },
  });
  return rows.map(mapProduct);
});

/**
 * "Lo más vendido" para el Home: no hay conteo de ventas real, así que se
 * aproxima con productos que ya no son "nuevo" (llevan tiempo en catálogo)
 * y tienen stock, ordenados por reseñas/rating como señal de popularidad.
 * Mezcla catálogos (pelucas, lentes, etc.), a diferencia de los queries
 * `...ByTipo` que sí filtran por uno solo.
 */
export const getBestSellers = cache(
  async (limit = 12): Promise<PublicProduct[]> => {
    const rows = await prisma.product.findMany({
      where: { nuevo: false, activo: true, stock: { gt: 0 } },
      orderBy: [{ reviews: "desc" }, { rating: "desc" }],
      take: limit,
      include: { category: { select: CATEGORIA_SELECT } },
    });
    return rows.map(mapProduct);
  },
);

/** Productos de un catálogo, filtrados por el tipo de su categoría. */
export const getPublicProductsByTipo = cache(
  async (tipoSlug: string): Promise<PublicProduct[]> => {
    const rows = await prisma.product.findMany({
      where: { category: { productType: { slug: tipoSlug } } },
      orderBy: { createdAt: "desc" },
      include: { category: { select: CATEGORIA_SELECT } },
    });
    return rows.map(mapProduct);
  },
);

export const getPublicProductBySlug = cache(
  async (slug: string): Promise<PublicProduct | null> => {
    const p = await prisma.product.findFirst({
      where: { slug },
      include: { category: { select: CATEGORIA_SELECT } },
    });
    return p ? mapProduct(p) : null;
  },
);

export const getAllProductSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
});

// ─────────────── Categorías ───────────────

export const getPublicCategories = cache(
  async (): Promise<PublicCategoryConTipo[]> => {
    const rows = await prisma.category.findMany({
      where: { activa: true },
      orderBy: [{ productType: { orden: "asc" } }, { orden: "asc" }],
      select: {
        id: true,
        slug: true,
        nombre: true,
        imagen: true,
        productType: { select: TIPO_SELECT },
      },
    });
    return rows.map(mapCategoria);
  },
);

/**
 * Filtros de un catálogo: las categorías de ese tipo que ya tienen al menos un
 * producto (incluidos agotados/desactivados, que siguen visibles). Una
 * categoría recién creada y vacía no aparece como pestaña vacía.
 */
export const getPublicCategoriesByTipo = cache(
  async (tipoSlug: string): Promise<PublicCategory[]> => {
    const rows = await prisma.category.findMany({
      where: {
        activa: true,
        productType: { slug: tipoSlug },
        products: { some: {} },
      },
      orderBy: { orden: "asc" },
      select: { id: true, slug: true, nombre: true, imagen: true },
    });
    return rows;
  },
);

/**
 * Categorías que el admin marcó como destacadas para el Home, de cualquier
 * catálogo: cada tarjeta enlaza al catálogo de su propio tipo. No lista todo,
 * solo lo elegido explícitamente, y exige al menos un producto para no llevar
 * a un catálogo filtrado y vacío.
 */
export const getFeaturedCategories = cache(
  async (): Promise<PublicCategoryConTipo[]> => {
    const rows = await prisma.category.findMany({
      where: {
        activa: true,
        destacada: true,
        productType: { activo: true },
        products: { some: {} },
      },
      orderBy: [{ productType: { orden: "asc" } }, { orden: "asc" }],
      select: {
        id: true,
        slug: true,
        nombre: true,
        imagen: true,
        productType: { select: TIPO_SELECT },
      },
    });
    return rows.map(mapCategoria);
  },
);
