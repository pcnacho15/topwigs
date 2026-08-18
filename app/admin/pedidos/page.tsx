import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCOP } from "@/components/ui/price";
import { formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/orders";
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

export const metadata: Metadata = { title: "Pedidos" };

const PAGE_SIZE = 20;

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; page?: string }>;
}) {
  const { estado, page: pageParam } = await searchParams;
  const status = ORDER_STATUSES.includes(estado as (typeof ORDER_STATUSES)[number])
    ? estado
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = status ? { status } : {};
  const [pedidos, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabHref = (value?: string) => (value ? `/admin/pedidos?estado=${value}` : "/admin/pedidos");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Pedidos
      </h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href={tabHref()}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            !status
              ? "border-neon bg-neon/15 text-neon"
              : "border-linea text-humo hover:text-blanco",
          )}
        >
          Todos
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={tabHref(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
              status === s
                ? "border-neon bg-neon/15 text-neon"
                : "border-linea text-humo hover:text-blanco",
            )}
          >
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-humo">
                    {o.reference}
                  </TableCell>
                  <TableCell className="text-blanco">
                    {o.customerName}
                    <p className="text-xs text-humo">{o.customerEmail}</p>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCOP(o.totalCop)}</TableCell>
                  <TableCell>
                    <span className={ORDER_STATUS_COLOR[o.status] ?? "text-humo"}>
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-humo">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-humo hover:text-neon"
                      >
                        <Link
                          href={`/admin/pedidos/${o.id}`}
                          aria-label={`Ver pedido ${o.reference}`}
                        >
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pedidos.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay pedidos {status ? `con estado "${ORDER_STATUS_LABEL[status]}"` : ""}{" "}
              todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={`/admin/pedidos?${status ? `estado=${status}&` : ""}page=${page - 1}`}>
                Anterior
              </Link>
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
              <Link href={`/admin/pedidos?${status ? `estado=${status}&` : ""}page=${page + 1}`}>
                Siguiente
              </Link>
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
