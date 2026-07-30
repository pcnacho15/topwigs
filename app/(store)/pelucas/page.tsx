import type { Metadata } from "next";
import { CatalogView } from "@/components/sections/catalog-view";
import {
  getPublicProductsByTipo,
  getPublicCategoriesByTipo,
} from "@/lib/queries/catalog";
import { CATALOGOS } from "@/data/catalogos";

const catalogo = CATALOGOS.peluca;

export const metadata: Metadata = {
  title: catalogo.label,
  description: catalogo.descripcion,
};

/**
 * Catálogo de pelucas. Lee `?categoria=` (de las tarjetas del Home) para
 * preseleccionar el filtro; el filtrado/búsqueda/paginación ocurre en el
 * cliente (CatalogView).
 */
export default async function PelucasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [productos, categorias] = await Promise.all([
    getPublicProductsByTipo(catalogo.tipo),
    getPublicCategoriesByTipo(catalogo.tipo),
  ]);

  const slugs = new Set(categorias.map((c) => c.slug));
  const initial = categoria && slugs.has(categoria) ? categoria : "todas";

  return (
    <CatalogView
      titulo={catalogo.label}
      ventana={catalogo.ventana}
      buscar={catalogo.buscar}
      productos={productos}
      categorias={categorias}
      initialCategoria={initial}
    />
  );
}
