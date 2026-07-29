import type { Metadata } from "next";
import { CatalogView } from "@/components/sections/catalog-view";
import { getPublicProducts, getPublicCategories } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora las pelucas y lentes TOPWIGS. Fibra seminatural, resistentes al calor.",
};

/**
 * Catálogo desde la base de datos. Lee `?categoria=` (de las tarjetas del
 * Home) para preseleccionar el filtro; el filtrado/búsqueda/paginación
 * ocurre en el cliente (CatalogView).
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [productos, categorias] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  const slugs = new Set(categorias.map((c) => c.slug));
  const initial = categoria && slugs.has(categoria) ? categoria : "todas";

  return (
    <CatalogView
      productos={productos}
      categorias={categorias}
      initialCategoria={initial}
    />
  );
}
