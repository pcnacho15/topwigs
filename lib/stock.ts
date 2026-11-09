import "server-only";
import { prisma } from "@/lib/db";
import {
  liberarReservasVencidas,
  reservaReutilizable,
} from "@/lib/stock-reservations";

/** slug → unidades que se pueden comprar ahora mismo. */
export type StockMap = Record<string, number>;

/**
 * Stock comprable de cada slug según la DB. Un producto inexistente o
 * desactivado cuenta como 0, igual que uno agotado: para el carrito es lo
 * mismo (no se puede comprar).
 *
 * `reservaPropia` es la referencia del último checkout de esta persona: sus
 * unidades apartadas se le suman, porque al volver a pagar se liberan a su
 * favor (ver `reemplazarReserva`).
 */
export async function getAvailableStock(
  slugs: string[],
  reservaPropia?: string | null,
): Promise<StockMap> {
  const unique = [...new Set(slugs)];
  const map: StockMap = Object.fromEntries(unique.map((s) => [s, 0]));
  if (unique.length === 0) return map;

  await liberarReservasVencidas();
  const [productos, propias] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { in: unique } },
      select: { slug: true, stock: true, activo: true },
    }),
    reservaPropia
      ? reservaReutilizable(reservaPropia)
      : Promise.resolve(new Map<string, number>()),
  ]);
  for (const p of productos) {
    map[p.slug] = p.activo
      ? Math.max(0, p.stock) + (propias.get(p.slug) ?? 0)
      : 0;
  }
  return map;
}
