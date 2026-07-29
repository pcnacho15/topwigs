import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCOP } from "@/components/ui/price";
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
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosPage() {
  const productos = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
          Productos
        </h1>
        <Button asChild>
          <Link href="/admin/productos/nueva">
            <Plus className="size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-blanco">
                    {p.nombre}
                    {p.nuevo ? (
                      <span className="ml-2 rounded-full bg-neon px-2 py-0.5 text-[9px] font-bold uppercase text-noir">
                        Nuevo
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-humo">{p.category.nombre}</TableCell>
                  <TableCell>
                    {p.precioOfertaCop ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-neon">
                          {formatCOP(p.precioOfertaCop)}
                        </span>
                        <span className="text-xs text-humo line-through">
                          {formatCOP(p.precioCop)}
                        </span>
                      </span>
                    ) : (
                      <span className="font-semibold">{formatCOP(p.precioCop)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={p.activo ? "text-neon" : "text-humo/60"}>
                      {p.activo ? "Activo" : "Oculto"}
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
                          href={`/admin/productos/${p.id}/editar`}
                          aria-label={`Editar ${p.nombre}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteProductButton id={p.id} nombre={p.nombre} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {productos.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay productos todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
