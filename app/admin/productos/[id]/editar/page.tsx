import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductInput, ColorSpec } from "@/lib/schemas/product";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: [{ productType: { orden: "asc" } }, { orden: "asc" }],
      select: {
        id: true,
        nombre: true,
        productType: { select: { id: true, label: true, slug: true } },
      },
    }),
  ]);
  if (!producto) notFound();

  const imagenes = producto.imagenes as unknown as string[];
  const videos = producto.videos as unknown as string[];
  // Los colores guardados antes de la asignación por color no traen
  // `imagenes`/`videos`; el formulario los necesita como arrays.
  const colores = (producto.colores as unknown as ColorSpec[]).map((c) => ({
    ...c,
    imagenes: (c.imagenes ?? []).filter((u) => imagenes.includes(u)),
    videos: (c.videos ?? []).filter((u) => videos.includes(u)),
  }));

  const opciones = categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipoId: c.productType.id,
    tipoLabel: c.productType.label,
    tipoSlug: c.productType.slug,
  }));

  const initial: ProductInput = {
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion,
    categoryId: producto.categoryId,
    precioCop: producto.precioCop,
    precioOfertaCop: producto.precioOfertaCop,
    rating: producto.rating,
    reviews: producto.reviews,
    nuevo: producto.nuevo,
    stock: producto.stock,
    activo: producto.activo,
    colores,
    features: producto.features as unknown as string[],
    imagenes,
    videos,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Editar producto
      </h1>
      <ProductForm
        mode="edit"
        id={producto.id}
        categorias={opciones}
        initial={initial}
      />
    </div>
  );
}
