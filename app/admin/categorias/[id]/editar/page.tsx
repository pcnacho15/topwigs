import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await prisma.category.findUnique({ where: { id } });
  if (!categoria) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Editar categoría
      </h1>
      <CategoryForm
        mode="edit"
        id={categoria.id}
        initial={{
          nombre: categoria.nombre,
          slug: categoria.slug,
          imagen: categoria.imagen,
          orden: categoria.orden,
          activa: categoria.activa,
        }}
      />
    </div>
  );
}
