import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/shadcn/table";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriasPage() {
  const categorias = await prisma.category.findMany({
    orderBy: { orden: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
          Categorías
        </h1>
        <Button asChild>
          <Link href="/admin/categorias/nueva">
            <Plus className="size-4" />
            Nueva categoría
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-blanco">
                    {c.nombre}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-humo">
                    {c.slug}
                  </TableCell>
                  <TableCell>{c.orden}</TableCell>
                  <TableCell>{c._count.products}</TableCell>
                  <TableCell>
                    <span
                      className={
                        c.activa ? "text-neon" : "text-humo/60"
                      }
                    >
                      {c.activa ? "Activa" : "Oculta"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-humo hover:text-neon"
                      >
                        <Link
                          href={`/admin/categorias/${c.id}/editar`}
                          aria-label={`Editar ${c.nombre}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteCategoryButton id={c.id} nombre={c.nombre} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {categorias.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay categorías todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
