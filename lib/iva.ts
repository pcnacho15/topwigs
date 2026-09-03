/**
 * "IVA" del checkout: en realidad es el costo de la comisión que cobra
 * Wompi por transacción (aún no tenemos una política de IVA sobre los
 * productos). Se muestra como IVA para que el cliente vea por qué el total
 * es más alto que subtotal + envío, y así la tienda recupera ese costo.
 *
 * Fórmula de Wompi (Colombia): comisión = 2.65% del monto + $700, y sobre
 * esa comisión se cobra 19% de IVA. Verificado con una transacción real de
 * $180.500 en la que Wompi cobró $1.041,81 de IVA:
 *   fee = 180500 * 0.0265 + 700 = 5483.25
 *   iva = fee * 0.19 = 1041.8175 ≈ 1041.81
 *
 * Aquí se cobra la comisión completa (fee + su IVA), no solo el 19%, para
 * que el cliente cubra el costo total de la pasarela.
 */
const WOMPI_FEE_PERCENT = 0.0265;
const WOMPI_FEE_FIXED_COP = 700;
const WOMPI_IVA_PERCENT = 0.19;

/**
 * IVA a cobrar sobre un monto base (subtotal + envío, antes del propio
 * IVA). Redondeado al peso porque el COP no maneja decimales.
 */
export function ivaCopFor(baseAmountCop: number): number {
  const fee = baseAmountCop * WOMPI_FEE_PERCENT + WOMPI_FEE_FIXED_COP;
  return Math.round(fee * (1 + WOMPI_IVA_PERCENT));
}
