"use server";

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-guard";
import { shippingCostFor } from "@/lib/shipping";
import { ivaCopFor } from "@/lib/iva";

interface CheckoutItem {
  slug: string;
  qty: number;
  colorNombre?: string | null;
}
interface Customer {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  departamento: string;
  municipio: string;
  barrio: string;
  indicaciones: string;
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
    select: {
      slug: true,
      nombre: true,
      precioCop: true,
      precioOfertaCop: true,
      stock: true,
      activo: true,
    },
  });
  const bySlug = new Map(productos.map((p) => [p.slug, p]));

  let subtotalCop = 0;
  const snapshot: {
    slug: string;
    nombre: string;
    precio: number;
    colorNombre: string | null;
    qty: number;
  }[] = [];

  for (const it of input.items) {
    const p = bySlug.get(it.slug);
    // Producto inexistente, desactivado o sin stock: no se puede comprar.
    if (!p || !p.activo || p.stock <= 0) continue;
    const qty = Math.max(1, Math.min(99, p.stock, Math.floor(it.qty)));
    const precio = p.precioOfertaCop ?? p.precioCop;
    subtotalCop += precio * qty;
    snapshot.push({
      slug: it.slug,
      nombre: p.nombre,
      precio,
      colorNombre: it.colorNombre ?? null,
      qty,
    });
  }
  if (subtotalCop <= 0) return { ok: false, error: "empty" };

  // Flete plano (Interrápidísimo) — mismo costo a todo el país, o gratis
  // si el subtotal (ya recalculado con precios de la BD) llega al umbral.
  const shippingCop = shippingCostFor(subtotalCop);
  const ivaCop = ivaCopFor(subtotalCop + shippingCop);
  const totalCop = subtotalCop + shippingCop + ivaCop;

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
      direccion: input.customer.direccion,
      departamento: input.customer.departamento,
      municipio: input.customer.municipio,
      barrio: input.customer.barrio,
      indicaciones: input.customer.indicaciones || null,
      items: json(snapshot),
      subtotalCop,
      shippingCop,
      ivaCop,
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
