import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCOP } from "@/components/ui/price";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/orders";
import { Button } from "@/components/shadcn/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/shadcn/table";

export const metadata: Metadata = { title: "Detalle del pedido" };

interface OrderItem {
  slug: string;
  nombre: string;
  precio: number;
  colorNombre: string | null;
  qty: number;
}

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await prisma.order.findUnique({ where: { id } });
  if (!pedido) notFound();

  const items = (pedido.items as unknown as OrderItem[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-humo hover:text-neon">
          <Link href="/admin/pedidos" aria-label="Volver a pedidos">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
          Pedido {pedido.reference}
        </h1>
        <span className={ORDER_STATUS_COLOR[pedido.status] ?? "text-humo"}>
          {ORDER_STATUS_LABEL[pedido.status] ?? pedido.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={`${item.slug}-${i}`}>
                    <TableCell className="text-blanco">{item.nombre}</TableCell>
                    <TableCell className="text-humo">{item.colorNombre ?? "—"}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCOP(item.precio * item.qty)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-1.5 border-t border-linea px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-humo">Subtotal</span>
                <span className="text-blanco">{formatCOP(pedido.subtotalCop)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-humo">Envío · Interrápidísimo</span>
                <span className="text-blanco">{formatCOP(pedido.shippingCop)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-humo">IVA</span>
                <span className="text-blanco">{formatCOP(pedido.ivaCop)}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="font-heading uppercase tracking-wide text-humo">Total</span>
                <span className="font-heading text-xl font-bold text-glow">
                  {formatCOP(pedido.totalCop)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-blanco">{pedido.customerName}</p>
              <p className="text-humo">{pedido.customerEmail}</p>
              <p className="text-humo">{pedido.customerPhone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-blanco">{pedido.direccion || "—"}</p>
              <p className="text-humo">
                {[pedido.barrio, pedido.municipio, pedido.departamento]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
              {pedido.indicaciones ? (
                <p className="pt-1 text-xs text-humo/80">
                  <span className="font-semibold text-humo">Indicaciones: </span>
                  {pedido.indicaciones}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-humo">Referencia</span>
                <span className="font-mono text-xs text-blanco">{pedido.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-humo">Transacción Wompi</span>
                <span className="font-mono text-xs text-blanco">
                  {pedido.wompiTransactionId ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-humo">Creado</span>
                <span className="text-blanco">{formatDate(pedido.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-humo">Actualizado</span>
                <span className="text-blanco">{formatDate(pedido.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
