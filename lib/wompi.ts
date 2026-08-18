import "server-only";
import { prisma } from "@/lib/db";

/** Estados de transacción de Wompi, iguales a `Order.status`. */
const VALID_STATUSES = new Set(["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"]);

export interface WompiTransactionStatus {
  id: string;
  reference: string;
  status: string;
  amountInCents: number;
}

/** `pub_prod_...` → producción, cualquier otro (`pub_test_...`) → sandbox. */
function wompiApiBase(): string {
  const key = process.env.WOMPI_PUBLIC_KEY ?? "";
  return key.startsWith("pub_prod_")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

/**
 * Consulta el estado real de una transacción directamente en la API de
 * Wompi (endpoint público de solo lectura, no requiere llave privada).
 * Se usa como respaldo cuando el webhook aún no ha llegado.
 */
export async function fetchWompiTransaction(
  id: string,
): Promise<WompiTransactionStatus | null> {
  try {
    const res = await fetch(`${wompiApiBase()}/transactions/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    const data = body?.data;
    if (!data?.id || !data?.reference || !data?.status) return null;
    return {
      id: data.id,
      reference: data.reference,
      status: data.status,
      amountInCents: data.amount_in_cents,
    };
  } catch {
    return null;
  }
}

export type ApplyResult =
  | { ok: true; status: string }
  | { ok: false; error: "order_not_found" | "amount_mismatch" };

/**
 * Aplica el estado de una transacción de Wompi al pedido correspondiente.
 * Idempotente y seguro de llamar varias veces (webhook + página de
 * resultado pueden invocarlo para la misma transacción sin duplicar nada).
 */
export async function applyWompiTransaction(tx: WompiTransactionStatus): Promise<ApplyResult> {
  const status = VALID_STATUSES.has(tx.status) ? tx.status : "ERROR";

  const order = await prisma.order.findUnique({ where: { reference: tx.reference } });
  if (!order) return { ok: false, error: "order_not_found" };

  // El monto reportado por Wompi debe coincidir con el que registramos al
  // crear el pedido (totalCop está en pesos, Wompi manda centavos).
  if (tx.amountInCents !== order.totalCop * 100) {
    return { ok: false, error: "amount_mismatch" };
  }

  // Nunca degradamos un pedido ya aprobado (protege contra eventos/consultas
  // que lleguen desordenados).
  if (order.status === "APPROVED" && status !== "APPROVED") {
    return { ok: true, status: order.status };
  }

  if (order.status !== status || order.wompiTransactionId !== tx.id) {
    await prisma.order.update({
      where: { reference: tx.reference },
      data: { status, wompiTransactionId: tx.id },
    });
  }

  return { ok: true, status };
}
