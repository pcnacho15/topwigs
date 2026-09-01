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

/**
 * Las categorías se listan agrupadas por tipo de producto: un apartado por
 * catálogo (pelucas, lentes, y los que se agreguen), cada uno con su propio
 * botón de "Nueva categoría" ya apuntando a ese tipo.
 */
export default async function CategoriasPage() {
  const tipos = await prisma.productType.findMany({
    orderBy: { orden: "asc" },
    include: {
      categories: {
        orderBy: { orden: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
            Categorías
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-humo">
            Cada categoría pertenece a un tipo de producto y solo aparece en el
            catálogo de ese tipo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/tipos">Tipos de producto</Link>
        </Button>
      </div>

      {tipos.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center text-sm text-humo">
            <p>No hay tipos de producto todavía.</p>
            <Button asChild variant="outline">
              <Link href="/admin/tipos/nuevo">Crear tipo de producto</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tipos.map((tipo) => (
        <section key={tipo.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-blanco">
                {tipo.label}
              </h2>
              <span className="font-mono text-xs text-humo">/{tipo.slug}</span>
              {!tipo.activo ? (
                <span className="text-xs text-humo/60">(oculto)</span>
              ) : null}
            </div>
            <Button asChild size="sm">
              <Link href={`/admin/categorias/nueva?tipo=${tipo.id}`}>
                <Plus className="size-4" />
                Nueva categoría
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {tipo.categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Destacada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tipo.categories.map((c) => (
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
                            className={c.activa ? "text-neon" : "text-humo/60"}
                          >
                            {c.activa ? "Activa" : "Oculta"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              c.destacada ? "text-neon" : "text-humo/60"
                            }
                          >
                            {c.destacada ? "Sí" : "No"}
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
                            <DeleteCategoryButton
                              id={c.id}
                              nombre={c.nombre}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-humo">
                  {tipo.label} todavía no tiene categorías.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}
