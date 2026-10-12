/**
 * Tarifa plana de envío nacional (Interrápidísimo) para todo el país fuera
 * de Antioquia. Único lugar donde vive este número: si el flete cambia, se
 * actualiza aquí.
 */
export const SHIPPING_COST_COP = 18500;

/** Tarifa de envío dentro de Antioquia (incluida Medellín). */
export const SHIPPING_COST_ANTIOQUIA_COP = 12000;

/** A partir de este subtotal (productos, sin flete) el envío no se cobra. */
export const FREE_SHIPPING_THRESHOLD_COP = 499_000;

/**
 * El departamento llega como texto libre del formulario: se compara sin
 * tildes, mayúsculas ni espacios sobrantes ("ANTIOQUÍA " cuenta).
 */
function esAntioquia(departamento: string | null | undefined): boolean {
  return (
    (departamento ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase() === "antioquia"
  );
}

/**
 * Flete que corresponde a un subtotal y un departamento de destino. Se usa
 * tanto en el resumen del checkout como al crear la orden en el servidor,
 * para que lo que ve el cliente y lo que se cobra salgan del mismo cálculo.
 *
 * El umbral es inclusivo: un subtotal de exactamente el umbral ya viaja
 * gratis, sin importar el departamento.
 */
export function shippingCostFor(
  subtotalCop: number,
  departamento?: string | null,
): number {
  if (subtotalCop >= FREE_SHIPPING_THRESHOLD_COP) return 0;
  return esAntioquia(departamento)
    ? SHIPPING_COST_ANTIOQUIA_COP
    : SHIPPING_COST_COP;
}

/**
 * El umbral en la forma corta que usa la cinta del header ("500MIL").
 * Asume múltiplos de mil, que es como se manejan estas promos.
 */
export const FREE_SHIPPING_LABEL = `${FREE_SHIPPING_THRESHOLD_COP / 1000}MIL`;
