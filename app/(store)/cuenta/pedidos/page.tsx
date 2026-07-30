import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { formatCOP } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { RetroWindow } from "@/components/ui/retro-window";
import { Button } from "@/components/ui/button";
import { HeartDrip } from "@/components/icons";

export const metadata: Metadata = { title: "Mis pedidos" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  DECLINED: "Rechazado",
  VOIDED: "Anulado",
  ERROR: "Error",
};

export default async function MisPedidosPage() {
  const session = await requireUser();
  const pedidos = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12">
      <SectionHeading centered={false}>Mis pedidos</SectionHeading>

      {pedidos.length > 0 ? (
        <ul className="space-y-4">
          {pedidos.map((p) => (
            <RetroWindow key={p.id} title={p.reference}>
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-heading text-sm font-bold uppercase tracking-wide">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </p>
                  <p className="text-xs text-humo">
                    {p.createdAt.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-heading text-lg font-bold text-glow">
                  {formatCOP(p.totalCop)}
                </span>
              </div>
            </RetroWindow>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <HeartDrip className="size-12 text-neon/40" />
          <p className="font-heading uppercase tracking-wide text-humo">
            Aún no tienes pedidos
          </p>
          <Link href="/pelucas">
            <Button variant="outline">Ir al catálogo</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
