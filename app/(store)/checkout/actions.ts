"use server";

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-guard";

interface CheckoutItem {
  slug: string;
  qty: number;
  colorNombre?: string | null;
}
interface Customer {
  nombre: string;
  email: string;
  telefono: string;
}

type Result =
  | { ok: true; url: string; reference: string }
  | { ok: false; error: "missing_keys" | "empty" };

const json = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * Crea la orden (PENDING) y genera la URL del Web Checkout de Wompi.
 *
 * Seguridad: el total se recalcula desde la DB (fuente de verdad), nunca
 * se confía en el monto del cliente. La firma de integridad usa el
 * WOMPI_INTEGRITY_SECRET (solo servidor).
 */
export async function createWompiCheckout(input: {
  items: CheckoutItem[];
  customer: Customer;
}): Promise<Result> {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integrity = process.env.WOMPI_INTEGRITY_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!publicKey || !integrity) {
    return { ok: false, error: "missing_keys" };
  }

  // Precios autoritativos desde la DB.
  const slugs = input.items.map((i) => i.slug);
  const productos = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, nombre: true, precioCop: true, precioOfertaCop: true },
  });
  const bySlug = new Map(productos.map((p) => [p.slug, p]));

  let totalCop = 0;
  const snapshot: {
    slug: string;
    nombre: string;
    precio: number;
    colorNombre: string | null;
    qty: number;
  }[] = [];

  for (const it of input.items) {
    const p = bySlug.get(it.slug);
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(it.qty)));
    const precio = p.precioOfertaCop ?? p.precioCop;
    totalCop += precio * qty;
    snapshot.push({
      slug: it.slug,
      nombre: p.nombre,
      precio,
      colorNombre: it.colorNombre ?? null,
      qty,
    });
  }
  if (totalCop <= 0) return { ok: false, error: "empty" };

  const reference = `TOPWIGS-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  // Persistimos la orden como PENDING (el webhook de Wompi la actualiza).
  const session = await getSession();
  await prisma.order.create({
    data: {
      reference,
      userId: session?.user.id ?? null,
      customerName: input.customer.nombre,
      customerEmail: input.customer.email,
      customerPhone: input.customer.telefono,
      items: json(snapshot),
      totalCop,
      status: "PENDING",
    },
  });

  const currency = "COP";
  const amountInCents = totalCop * 100;
  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${integrity}`)
    .digest("hex");

  const redirectUrl = `${baseUrl}/checkout/resultado`;
  const query = [
    `public-key=${encodeURIComponent(publicKey)}`,
    `currency=${currency}`,
    `amount-in-cents=${amountInCents}`,
    `reference=${encodeURIComponent(reference)}`,
    `signature:integrity=${signature}`,
    `redirect-url=${encodeURIComponent(redirectUrl)}`,
    `customer-data:full-name=${encodeURIComponent(input.customer.nombre)}`,
    `customer-data:email=${encodeURIComponent(input.customer.email)}`,
    `customer-data:phone-number=${encodeURIComponent(input.customer.telefono)}`,
  ].join("&");

  return {
    ok: true,
    reference,
    url: `https://checkout.wompi.co/p/?${query}`,
  };
}
