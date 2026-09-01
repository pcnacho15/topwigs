import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/shadcn/button";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NuevaCategoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const [{ tipo }, tipos] = await Promise.all([
    searchParams,
    prisma.productType.findMany({
      orderBy: { orden: "asc" },
      select: { id: true, label: true },
    }),
  ]);

  // `?tipo=` viene del botón de cada apartado del listado; si no corresponde a
  // un tipo real se ignora y el formulario cae en el primero.
  const defaultTipoId = tipos.some((t) => t.id === tipo) ? tipo : undefined;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Nueva categoría
      </h1>
      {tipos.length > 0 ? (
        <CategoryForm
          mode="create"
          tipos={tipos}
          defaultTipoId={defaultTipoId}
        />
      ) : (
        <div className="space-y-3 text-humo">
          <p>Primero crea al menos un tipo de producto.</p>
          <Button asChild variant="outline">
            <Link href="/admin/tipos/nuevo">Crear tipo de producto</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
