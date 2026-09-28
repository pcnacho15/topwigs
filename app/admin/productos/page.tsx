import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import type { Prisma } from "@prisma/client";
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
import { ProductFiltersBar } from "@/components/admin/product-filters";
import { BestSellerToggle } from "@/components/admin/best-seller-toggle";
import {
  parseProductFilters,
  hasActiveFilters,
  productFiltersHref,
  type ProductFilters,
} from "@/lib/admin-product-filters";

export const metadata: Metadata = { title: "Productos" };

const PAGE_SIZE = 20;

// Puede comprarse, y por lo tanto salir en "Lo más vendido".
const DISPONIBLE: Prisma.ProductWhereInput = { activo: true, stock: { gt: 0 } };
const AGOTADO: Prisma.ProductWhereInput = { OR: [{ activo: false }, { stock: { lte: 0 } }] };

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  if (f.q) and.push({ nombre: { contains: f.q, mode: "insensitive" } });
  if (f.tipo) and.push({ category: { productTypeId: f.tipo } });
  if (f.categoria) and.push({ categoryId: f.categoria });
  if (f.min || f.max) {
    // Precio efectivo: el de oferta si lo tiene, si no el normal.
    const range = {
      ...(f.min ? { gte: Number(f.min) } : {}),
      ...(f.max ? { lte: Number(f.max) } : {}),
    };
    and.push({
      OR: [{ precioOfertaCop: range }, { precioOfertaCop: null, precioCop: range }],
    });
  }
  if (f.stock === "con") and.push({ stock: { gt: 0 } });
  if (f.stock === "sin") and.push({ stock: { lte: 0 } });
  if (f.estado === "disponible") and.push(DISPONIBLE);
  if (f.estado === "agotado") and.push(AGOTADO);
  if (f.nuevo) and.push({ nuevo: f.nuevo === "si" });
  if (f.vendido === "si") and.push({ masVendido: true, ...DISPONIBLE });
  if (f.vendido === "no") and.push({ OR: [{ masVendido: false }, AGOTADO] });
  return and.length ? { AND: and } : {};
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const page = Math.max(1, Number(sp.page) || 1);

  const where = buildWhere(filters);
  const [productos, total, tipos, categorias] = await Promise.all([
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
    prisma.productType.findMany({
      orderBy: [{ orden: "asc" }, { label: "asc" }],
      select: { id: true, label: true },
    }),
    prisma.category.findMany({
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, productTypeId: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (n: number) => productFiltersHref(filters, n);

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

      <ProductFiltersBar
        initial={filters}
        tipos={tipos}
        categorias={categorias.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          tipoId: c.productTypeId,
        }))}
        total={total}
      />

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
                    {p.masVendido && p.activo && p.stock > 0 ? (
                      <span className="ml-2 rounded-full border border-neon px-2 py-0.5 text-[9px] font-bold uppercase text-neon">
                        Más vendido
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
                      {/* Solo los que pueden salir en "Lo más vendido"
                          (disponibles y con stock); el hueco mantiene
                          alineados los demás botones. */}
                      {p.activo && p.stock > 0 ? (
                        <BestSellerToggle
                          id={p.id}
                          nombre={p.nombre}
                          masVendido={p.masVendido}
                        />
                      ) : (
                        <span className="size-10" aria-hidden />
                      )}
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
              {hasActiveFilters(filters)
                ? "No hay productos que coincidan con los filtros."
                : "No hay productos todavía."}
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
