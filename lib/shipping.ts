/**
 * Tarifa plana de envío nacional (Interrápidísimo). Mismo costo para todo
 * el país, incluida Medellín. Único lugar donde vive este número: si el
 * flete cambia, se actualiza aquí.
 */
export const SHIPPING_COST_COP = 18500;

/** A partir de este subtotal (productos, sin flete) el envío no se cobra. */
export const FREE_SHIPPING_THRESHOLD_COP = 499_000;

/**
 * Flete que corresponde a un subtotal. Se usa tanto en el resumen del
 * checkout como al crear la orden en el servidor, para que lo que ve el
 * cliente y lo que se cobra salgan del mismo cálculo.
 *
 * El umbral es inclusivo: un subtotal de exactamente $500.000 ya viaja
 * gratis.
 */
export function shippingCostFor(subtotalCop: number): number {
  return subtotalCop >= FREE_SHIPPING_THRESHOLD_COP ? 0 : SHIPPING_COST_COP;
}

/**
 * El umbral en la forma corta que usa la cinta del header ("500MIL").
 * Asume múltiplos de mil, que es como se manejan estas promos.
 */
export const FREE_SHIPPING_LABEL = `${FREE_SHIPPING_THRESHOLD_COP / 1000}MIL`;
