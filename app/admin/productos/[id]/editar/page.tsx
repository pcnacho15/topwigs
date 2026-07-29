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
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);
  if (!producto) notFound();

  const initial: ProductInput = {
    nombre: producto.nombre,
    slug: producto.slug,
    tipo: producto.tipo === "lente" ? "lente" : "peluca",
    descripcion: producto.descripcion,
    categoryId: producto.categoryId,
    precioCop: producto.precioCop,
    precioOfertaCop: producto.precioOfertaCop,
    rating: producto.rating,
    reviews: producto.reviews,
    nuevo: producto.nuevo,
    activo: producto.activo,
    colores: producto.colores as unknown as ColorSpec[],
    features: producto.features as unknown as string[],
    imagenes: producto.imagenes as unknown as string[],
    videos: producto.videos as unknown as string[],
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Editar producto
      </h1>
      <ProductForm
        mode="edit"
        id={producto.id}
        categorias={categorias}
        initial={initial}
      />
    </div>
  );
}
