import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Reservas de inventario de los pedidos.
 *
 * Al crear la orden se APARTAN las unidades (el stock baja de una vez), así
 * dos personas no pueden pagar la última unidad al mismo tiempo. Después:
 *  - pago aprobado          → la reserva se confirma (COMMITTED), sin tocar stock
 *  - la reserva vence       → las unidades vuelven al stock (RELEASED)
 *  - aprobado tras liberar  → se intenta descontar de nuevo; si ya no hay,
 *                             el pedido queda OVERSOLD para que el admin lo vea
 *
 * Un pago rechazado NO libera la reserva al instante: en el mismo checkout
 * de Wompi la persona puede reintentar con otro medio de pago, y su unidad
 * debe seguir apartada. Se libera al vencer (o si la misma persona vuelve
 * a pagar desde la tienda, ver `reemplazarReserva`).
 */

/** Cuánto vive el link de pago de Wompi (`expiration-time`). */
export const CHECKOUT_TTL_MS = 30 * 60 * 1000;
/**
 * Cuánto dura la reserva. Más que el link: Wompi solo impide INICIAR el
 * pago al vencer, y un PSE/Nequi iniciado al final puede tardar en
 * resolverse.
 */
export const RESERVA_TTL_MS = 60 * 60 * 1000;

export const STOCK_STATUS = {
  RESERVED: "RESERVED",
  COMMITTED: "COMMITTED",
  RELEASED: "RELEASED",
  OVERSOLD: "OVERSOLD",
} as const;

type Tx = Prisma.TransactionClient;

export interface StockLine {
  slug: string;
  qty: number;
}

/** Lanzado dentro de la transacción de reserva: hace rollback de todo. */
export class StockInsuficienteError extends Error {
  constructor(public readonly slug: string) {
    super(`Stock insuficiente para ${slug}`);
    this.name = "StockInsuficienteError";
  }
}

/**
 * Suma las líneas por producto (el stock es por producto, no por color).
 * Ordenado por slug para que todas las transacciones bloqueen las filas de
 * `Product` en el mismo orden y no se produzcan deadlocks entre sí.
 */
function porProducto(items: StockLine[]): [string, number][] {
  const map = new Map<string, number>();
  for (const it of items) {
    const qty = Math.floor(Number(it.qty));
    if (typeof it.slug !== "string" || !Number.isFinite(qty) || qty < 1) {
      continue;
    }
    map.set(it.slug, (map.get(it.slug) ?? 0) + qty);
  }
  return [...map].sort(([a], [b]) => a.localeCompare(b));
}

/** Lee las líneas del snapshot JSON de un pedido. */
export function lineasDePedido(items: Prisma.JsonValue): StockLine[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw) => {
    const it = raw as { slug?: unknown; qty?: unknown };
    return typeof it?.slug === "string" && typeof it.qty === "number"
      ? [{ slug: it.slug, qty: it.qty }]
      : [];
  });
}

/**
 * Aparta las unidades dentro de una transacción. El descuento es
 * condicional (`stock >= qty`) y atómico en Postgres: si dos compras
 * compiten por la última unidad, la segunda ve el stock ya descontado y
 * falla. Si algún producto no alcanza, lanza y la transacción se revierte.
 */
export async function reservarStock(tx: Tx, items: StockLine[]): Promise<void> {
  for (const [slug, qty] of porProducto(items)) {
    const r = await tx.product.updateMany({
      where: { slug, activo: true, stock: { gte: qty } },
      data: { stock: { decrement: qty } },
    });
    if (r.count === 0) throw new StockInsuficienteError(slug);
  }
}

async function devolverStock(tx: Tx, items: StockLine[]): Promise<void> {
  for (const [slug, qty] of porProducto(items)) {
    await tx.product.updateMany({
      where: { slug },
      data: { stock: { increment: qty } },
    });
  }
}

/**
 * Cuando la misma persona vuelve a pagar (salió de Wompi sin pagar, o el
 * pago fue rechazado), su reserva anterior se libera dentro de la misma
 * transacción que crea la nueva: así no se bloquea a sí misma y nadie más
 * alcanza a quedarse con esas unidades en el medio.
 *
 * Solo se libera si no hay un pago en curso: si Wompi ya reportó una
 * transacción PENDING (p. ej. un PSE esperando al banco) la reserva se
 * respeta, porque ese pago todavía puede aprobarse.
 */
export async function reemplazarReserva(
  tx: Tx,
  reference: string,
): Promise<void> {
  const order = await tx.order.findUnique({
    where: { reference },
    select: { id: true, items: true },
  });
  if (!order) return;
  const claimed = await tx.order.updateMany({
    where: {
      id: order.id,
      stockStatus: STOCK_STATUS.RESERVED,
      OR: [
        { status: { in: ["DECLINED", "VOIDED", "ERROR"] } },
        { status: "PENDING", wompiTransactionId: null },
      ],
    },
    data: { stockStatus: STOCK_STATUS.RELEASED, reservaExpiraEn: null },
  });
  if (claimed.count > 0) await devolverStock(tx, lineasDePedido(order.items));
}

/**
 * Unidades que el pedido `reference` tiene reservadas y que su dueño podría
 * reutilizar al volver a pagar (mismas condiciones que `reemplazarReserva`).
 * Se suman al stock visible del carrito para que no se recorte solo.
 */
export async function reservaReutilizable(
  reference: string,
): Promise<Map<string, number>> {
  const order = await prisma.order.findFirst({
    where: {
      reference,
      stockStatus: STOCK_STATUS.RESERVED,
      OR: [
        { status: { in: ["DECLINED", "VOIDED", "ERROR"] } },
        { status: "PENDING", wompiTransactionId: null },
      ],
    },
    select: { items: true },
  });
  return new Map(order ? porProducto(lineasDePedido(order.items)) : []);
}

/**
 * Marca como vendidas las unidades de un pedido aprobado. Idempotente: se
 * puede llamar varias veces (webhook + página de resultado) y solo actúa
 * una vez, porque cada camino "reclama" el pedido con un update
 * condicional sobre `stockStatus`.
 */
export async function confirmarStockPedido(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Caso normal: la reserva sigue vigente, las unidades ya estaban fuera.
    const reservado = await tx.order.updateMany({
      where: { id: orderId, stockStatus: STOCK_STATUS.RESERVED },
      data: { stockStatus: STOCK_STATUS.COMMITTED, reservaExpiraEn: null },
    });
    if (reservado.count > 0) return;

    // Pedido anterior a las reservas (null) o aprobado después de que su
    // reserva venció (RELEASED): hay que descontar ahora.
    const pendiente = await tx.order.updateMany({
      where: {
        id: orderId,
        OR: [{ stockStatus: null }, { stockStatus: STOCK_STATUS.RELEASED }],
      },
      data: { stockStatus: STOCK_STATUS.COMMITTED, reservaExpiraEn: null },
    });
    if (pendiente.count === 0) return; // ya confirmado antes

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { items: true, reference: true },
    });
    let sobreventa = false;
    for (const [slug, qty] of porProducto(lineasDePedido(order.items))) {
      const r = await tx.product.updateMany({
        where: { slug, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (r.count === 0) {
        // El cliente ya pagó: el pedido se respeta, pero no hay unidades.
        // El stock queda en 0 y el pedido marcado para que el admin decida.
        sobreventa = true;
        await tx.product.updateMany({ where: { slug }, data: { stock: 0 } });
      }
    }
    if (sobreventa) {
      console.error(
        `Stock: pedido ${order.reference} aprobado sin unidades suficientes (sobreventa).`,
      );
      await tx.order.update({
        where: { id: orderId },
        data: { stockStatus: STOCK_STATUS.OVERSOLD },
      });
    }
  });
}

// Marca de tiempo de la última limpieza en ESTA instancia del servidor. Solo
// sirve para no repetir la consulta en cada request; no es estado de
// negocio (la exclusión real entre instancias la dan los updates
// condicionales de abajo).
let ultimaLimpieza = 0;
const LIMPIEZA_CADA_MS = 60 * 1000;

/**
 * Devuelve al stock las reservas vencidas de pedidos sin pago aprobado.
 * No hay cron: se llama de forma perezosa (y como mucho una vez por minuto)
 * desde los puntos que leen stock — catálogo, ficha, carrito y checkout —
 * así el stock está al día justo cuando alguien lo va a ver o comprar.
 */
export async function liberarReservasVencidas(): Promise<void> {
  const ahora = Date.now();
  if (ahora - ultimaLimpieza < LIMPIEZA_CADA_MS) return;
  ultimaLimpieza = ahora;

  try {
    const vencidas = await prisma.order.findMany({
      where: {
        stockStatus: STOCK_STATUS.RESERVED,
        reservaExpiraEn: { lt: new Date(ahora) },
        status: { not: "APPROVED" },
      },
      select: { id: true, items: true },
      take: 100,
    });
    for (const o of vencidas) {
      await prisma.$transaction(async (tx) => {
        // Si justo llegó la aprobación, este update no reclama nada y la
        // reserva pasa a COMMITTED por `confirmarStockPedido`.
        const claimed = await tx.order.updateMany({
          where: {
            id: o.id,
            stockStatus: STOCK_STATUS.RESERVED,
            status: { not: "APPROVED" },
          },
          data: { stockStatus: STOCK_STATUS.RELEASED },
        });
        if (claimed.count > 0) await devolverStock(tx, lineasDePedido(o.items));
      });
    }
  } catch (err) {
    // Nunca debe tumbar la página que la invoca; se reintenta en la próxima.
    ultimaLimpieza = 0;
    console.error("Stock: no se pudieron liberar reservas vencidas", err);
  }
}
