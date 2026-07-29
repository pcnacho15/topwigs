import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/shadcn/button";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NuevoProductoPage() {
  const categorias = await prisma.category.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Nuevo producto
      </h1>
      {categorias.length > 0 ? (
        <ProductForm mode="create" categorias={categorias} />
      ) : (
        <div className="space-y-3 text-humo">
          <p>Primero crea al menos una categoría.</p>
          <Button asChild variant="outline">
            <Link href="/admin/categorias/nueva">Crear categoría</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
