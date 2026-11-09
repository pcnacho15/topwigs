"use server";

import { getAvailableStock, type StockMap } from "@/lib/stock";

/**
 * Stock actual de los productos del carrito. El carrito vive en
 * localStorage, así que el cliente lo consulta al cargar para recortar
 * cantidades que ya no hay. `reservaPropia` es la referencia de su último
 * checkout sin pagar (sus unidades apartadas cuentan como suyas).
 */
export async function getCartStock(
  slugs: unknown,
  reservaPropia?: unknown,
): Promise<StockMap> {
  if (!Array.isArray(slugs)) return {};
  const clean = slugs
    .filter((s): s is string => typeof s === "string" && s.length <= 200)
    .slice(0, 100);
  const ref =
    typeof reservaPropia === "string" && reservaPropia.length <= 100
      ? reservaPropia
      : null;
  return getAvailableStock(clean, ref);
}
