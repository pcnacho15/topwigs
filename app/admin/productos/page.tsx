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
import { ProductSearch } from "@/components/admin/product-search";

export const metadata: Metadata = { title: "Productos" };

const PAGE_SIZE = 20;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qParam, page: pageParam } = await searchParams;
  const q = qParam?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = q ? { nombre: { contains: q, mode: "insensitive" as const } } : {};
  const [productos, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: {
          select: { nombre: true, productType: { select: { label: true } } },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(n));
    return `/admin/productos?${params}`;
  };

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

      <ProductSearch initialQuery={q} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
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
                      <span className="ml-2 rounded-full bg-neon px-2 py-0.5 text-[9px] font-bold uppercase text-ink">
                        Nuevo
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-humo">
                    {p.category.productType.label}
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
                  <TableCell className="text-humo">{p.stock}</TableCell>
                  <TableCell>
                    {!p.activo || p.stock <= 0 ? (
                      <span className="text-humo/60">Agotado</span>
                    ) : (
                      <span className="text-neon">Disponible</span>
                    )}
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
              {q ? `No se encontraron productos para "${q}".` : "No hay productos todavía."}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1)}>Anterior</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Anterior
            </Button>
          )}
          <span className="text-sm text-humo">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1)}>Siguiente</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Siguiente
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
