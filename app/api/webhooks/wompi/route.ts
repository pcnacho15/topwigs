import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { applyWompiTransaction } from "@/lib/wompi";

/**
 * Webhook de eventos de Wompi (`transaction.updated`).
 * Configúralo en comercios.wompi.co → Desarrolladores → URL de eventos,
 * apuntando a `${NEXT_PUBLIC_BASE_URL}/api/webhooks/wompi`.
 *
 * Esta es la fuente de verdad principal para aprobar un pedido (con
 * respaldo en `/checkout/resultado`, ver `lib/wompi.ts`): el redirect al
 * navegador no es confiable por sí solo (el cliente puede cerrar la
 * pestaña antes, o el estado puede cambiar después del redirect).
 */

interface WompiTransaction {
  id: string;
  amount_in_cents: number;
  reference: string;
  status: string;
}

interface WompiEvent {
  event: string;
  data: { transaction: WompiTransaction };
  timestamp: number;
  signature: { properties: string[]; checksum: string };
}

/** Lee `data.transaction.id` a partir de la ruta `"transaction.id"`. */
function readProperty(data: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      data,
    );
  return value === undefined || value === null ? "" : String(value);
}

/** Firma esperada: sha256(propiedades concatenadas + timestamp + secreto). */
function verifySignature(body: WompiEvent, secret: string): boolean {
  const concatenated = body.signature.properties
    .map((path) => readProperty(body.data, path))
    .join("");
  const expected = createHash("sha256")
    .update(`${concatenated}${body.timestamp}${secret}`)
    .digest("hex");
  return expected.toUpperCase() === body.signature.checksum.toUpperCase();
}

export async function POST(req: NextRequest) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    console.error("Webhook Wompi: falta WOMPI_EVENTS_SECRET en el servidor.");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let body: WompiEvent;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body?.signature?.checksum || !verifySignature(body, secret)) {
    console.error("Webhook Wompi: firma inválida, evento descartado.");
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Solo nos interesan las actualizaciones de transacción; cualquier otro
  // evento se confirma (200) para que Wompi no lo reintente.
  if (body.event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const tx = body.data.transaction;
  const result = await applyWompiTransaction({
    id: tx.id,
    reference: tx.reference,
    status: tx.status,
    amountInCents: tx.amount_in_cents,
  });

  if (!result.ok) {
    if (result.error === "order_not_found") {
      console.error(`Webhook Wompi: orden no encontrada para reference=${tx.reference}`);
      return NextResponse.json({ ok: true }); // no reintentar, no la vamos a encontrar
    }
    console.error(`Webhook Wompi: ${result.error} para reference=${tx.reference}`);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
