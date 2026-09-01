import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductTypeForm } from "@/components/admin/product-type-form";

export const metadata: Metadata = { title: "Editar tipo de producto" };

export default async function EditarTipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tipo = await prisma.productType.findUnique({ where: { id } });
  if (!tipo) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Editar tipo de producto
      </h1>
      <ProductTypeForm
        mode="edit"
        id={tipo.id}
        initial={{
          nombre: tipo.nombre,
          label: tipo.label,
          slug: tipo.slug,
          descripcion: tipo.descripcion,
          orden: tipo.orden,
          activo: tipo.activo,
        }}
      />
    </div>
  );
}
