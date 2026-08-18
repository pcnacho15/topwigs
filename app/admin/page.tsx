import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShoppingBag, Package, Tags } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCOP } from "@/components/ui/price";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/orders";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/shadcn/table";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount, agg, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalCop: true },
        where: { status: "APPROVED" },
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  const revenue = agg._sum.totalCop ?? 0;

  const tiles = [
    { label: "Ventas (aprobadas)", value: formatCOP(revenue), Icon: DollarSign },
    { label: "Pedidos", value: String(orderCount), Icon: ShoppingBag },
    { label: "Productos", value: String(productCount), Icon: Package },
    { label: "Categorías", value: String(categoryCount), Icon: Tags },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{label}</CardTitle>
              <Icon className="size-4 text-neon" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-blanco">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pedidos recientes</CardTitle>
          <Link href="/admin/pedidos" className="text-xs text-humo hover:text-neon">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.reference}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>
                      <span className={ORDER_STATUS_COLOR[o.status] ?? "text-humo"}>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCOP(o.totalCop)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-humo">
              Aún no hay pedidos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
