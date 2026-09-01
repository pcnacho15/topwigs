import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/sections/catalog-view";
import {
  getCatalogo,
  getPublicProductsByTipo,
  getPublicCategoriesByTipo,
} from "@/lib/queries/catalog";

// Los catálogos los crea el admin en la base de datos, así que la ruta no se
// puede prerenderizar a build time: se resuelve en cada visita, igual que la
// ficha de producto.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ catalogo: string }>;
}): Promise<Metadata> {
  const { catalogo } = await params;
  const tipo = await getCatalogo(catalogo);
  if (!tipo) return { title: "Catálogo no encontrado" };
  return { title: tipo.label, description: tipo.descripcion };
}

/**
 * Catálogo de un tipo de producto (`/pelucas`, `/lentes`, y los que agregue el
 * admin). Lee `?categoria=` (de las tarjetas del Home) para preseleccionar el
 * filtro; el filtrado/búsqueda/paginación ocurre en el cliente (CatalogView).
 */
export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ catalogo: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { catalogo } = await params;
  const tipo = await getCatalogo(catalogo);
  if (!tipo) notFound();

  const { categoria } = await searchParams;
  const [productos, categorias] = await Promise.all([
    getPublicProductsByTipo(tipo.slug),
    getPublicCategoriesByTipo(tipo.slug),
  ]);

  const slugs = new Set(categorias.map((c) => c.slug));
  const initial = categoria && slugs.has(categoria) ? categoria : "todas";

  return (
    <CatalogView
      titulo={tipo.label}
      ventana={`${tipo.slug}.exe`}
      buscar={`Buscar ${tipo.nombre.toLowerCase()}…`}
      productos={productos}
      categorias={categorias}
      initialCategoria={initial}
    />
  );
}
