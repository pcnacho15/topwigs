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
import { DeleteProductTypeButton } from "@/components/admin/delete-product-type-button";

export const metadata: Metadata = { title: "Tipos de producto" };

export default async function TiposPage() {
  const tipos = await prisma.productType.findMany({
    orderBy: { orden: "asc" },
    include: {
      _count: { select: { categories: true } },
      categories: { select: { _count: { select: { products: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
            Tipos de producto
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-humo">
            Cada tipo es un catálogo de la tienda, con su propia URL, su lugar
            en el menú y sus propias categorías.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tipos/nuevo">
            <Plus className="size-4" />
            Nuevo tipo
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Categorías</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-semibold text-blanco">
                    {t.label}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-humo">
                    /{t.slug}
                  </TableCell>
                  <TableCell>{t.orden}</TableCell>
                  <TableCell>{t._count.categories}</TableCell>
                  <TableCell>
                    {t.categories.reduce((n, c) => n + c._count.products, 0)}
                  </TableCell>
                  <TableCell>
                    <span className={t.activo ? "text-neon" : "text-humo/60"}>
                      {t.activo ? "Activo" : "Oculto"}
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
                          href={`/admin/tipos/${t.id}/editar`}
                          aria-label={`Editar ${t.label}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteProductTypeButton id={t.id} nombre={t.label} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {tipos.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay tipos de producto todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
