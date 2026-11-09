"use server";

import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-guard";
import { shippingCostFor } from "@/lib/shipping";
import { ubicacionValida } from "@/data/colombia";
import { getAvailableStock, type StockMap } from "@/lib/stock";
import {
  CHECKOUT_TTL_MS,
  RESERVA_TTL_MS,
  STOCK_STATUS,
  StockInsuficienteError,
  reemplazarReserva,
  reservarStock,
} from "@/lib/stock-reservations";
// import { ivaCopFor } from "@/lib/iva"; 

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
  | { ok: false; error: "missing_keys" | "empty" | "invalid_location" }
  /** El carrito pide más de lo que hay: no se crea la orden. `stock` trae
   * el disponible real (slug → unidades) para que el cliente se ajuste. */
  | { ok: false; error: "insufficient_stock"; stock: StockMap };

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
  /** Referencia del checkout anterior de este navegador sin pagar: su
   * reserva se libera al crear la nueva (ver `reemplazarReserva`). */
  reemplaza?: string | null;
}): Promise<Result> {
  const reemplaza =
    typeof input.reemplaza === "string" && input.reemplaza.length <= 100
      ? input.reemplaza
      : null;
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integrity = process.env.WOMPI_INTEGRITY_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!publicKey || !integrity) {
    return { ok: false, error: "missing_keys" };
  }

  // Departamento y municipio vienen de selects: si no están en la lista
  // oficial, el formulario fue manipulado y el flete no se puede calcular.
  if (
    !ubicacionValida(input.customer.departamento, input.customer.municipio)
  ) {
    return { ok: false, error: "invalid_location" };
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
    },
  });
  const bySlug = new Map(productos.map((p) => [p.slug, p]));

  // El stock es por producto, pero el carrito trae una línea por color:
  // hay que sumar todas las líneas del mismo slug antes de comparar. Si
  // algo no alcanza se rechaza el pago completo (en vez de recortar en
  // silencio y cobrar un pedido distinto al que la persona vio).
  const pedido = new Map<string, number>();
  for (const it of input.items) {
    const qty = Math.floor(Number(it.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    pedido.set(it.slug, (pedido.get(it.slug) ?? 0) + qty);
  }
  // Chequeo rápido para fallar temprano con un mensaje útil (incluye la
  // reserva propia de un checkout anterior sin pagar). La garantía real la
  // da `reservarStock` más abajo, que es atómico.
  const disponible = await getAvailableStock([...pedido.keys()], reemplaza);
  if ([...pedido].some(([slug, qty]) => qty > (disponible[slug] ?? 0))) {
    return { ok: false, error: "insufficient_stock", stock: disponible };
  }

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
    const qty = Math.floor(Number(it.qty));
    // El stock ya se validó arriba (y se reserva abajo): aquí solo se
    // descartan líneas inválidas.
    if (!p || !Number.isFinite(qty) || qty < 1) continue;
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

  // Flete según departamento (Antioquia tiene tarifa propia), o gratis si
  // el subtotal (ya recalculado con precios de la BD) llega al umbral.
  const shippingCop = shippingCostFor(
    subtotalCop,
    input.customer.departamento,
  );
  // const ivaCop = ivaCopFor(subtotalCop + shippingCop);
  const totalCop = subtotalCop + shippingCop /*+ ivaCop*/;

  // Parte aleatoria criptográfica: la referencia sirve para reemplazar la
  // reserva propia (`reemplaza`), así que no debe poder adivinarse.
  const reference = `TOPWIGS-${Date.now()}-${randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
  const ahora = Date.now();
  // El link de pago vence antes que la reserva (ver RESERVA_TTL_MS).
  const expiracion = new Date(ahora + CHECKOUT_TTL_MS).toISOString();

  // Orden PENDING + reserva de stock en una sola transacción: o queda la
  // orden con sus unidades apartadas, o no queda nada. El webhook de Wompi
  // la actualiza después.
  const session = await getSession();
  try {
    await prisma.$transaction(async (tx) => {
      if (reemplaza) await reemplazarReserva(tx, reemplaza);
      await reservarStock(tx, snapshot);
      await tx.order.create({
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
          // ivaCop,
          totalCop,
          status: "PENDING",
          stockStatus: STOCK_STATUS.RESERVED,
          reservaExpiraEn: new Date(ahora + RESERVA_TTL_MS),
        },
      });
    });
  } catch (err) {
    // Otra compra se llevó las unidades entre el chequeo y la reserva.
    if (err instanceof StockInsuficienteError) {
      return {
        ok: false,
        error: "insufficient_stock",
        stock: await getAvailableStock([...pedido.keys()], reemplaza),
      };
    }
    throw err;
  }

  const currency = "COP";
  const amountInCents = totalCop * 100;
  // Con `expiration-time`, Wompi exige concatenarlo antes del secreto.
  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${expiracion}${integrity}`)
    .digest("hex");

  const redirectUrl = `${baseUrl}/checkout/resultado`;
  const query = [
    `public-key=${encodeURIComponent(publicKey)}`,
    `currency=${currency}`,
    `amount-in-cents=${amountInCents}`,
    `reference=${encodeURIComponent(reference)}`,
    `signature:integrity=${signature}`,
    `expiration-time=${encodeURIComponent(expiracion)}`,
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
