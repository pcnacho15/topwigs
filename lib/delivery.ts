/**
 * Estimación de despacho y entrega.
 *
 * El pedido se despacha el siguiente día hábil y llega
 * `DELIVERY_BUSINESS_DAYS` días hábiles después del despacho. Solo se saltan
 * sábados y domingos: los festivos colombianos NO se tienen en cuenta, así
 * que en semanas con festivo la fecha real se corre un día. Por eso el texto
 * se muestra como aproximado.
 *
 * Todo se calcula sobre la fecha de Colombia, no la del servidor: si Vercel
 * corre en UTC, pasadas las 19:00 en Bogotá ya sería "mañana" allá y la
 * estimación saldría un día adelantada.
 */

export const DELIVERY_BUSINESS_DAYS = 3;

const TIME_ZONE = "America/Bogota";

/**
 * Año/mes/día en Bogotá, como fecha "desnuda" anclada a medianoche UTC.
 * Anclarla a UTC deja la aritmética de días libre de horarios y saltos.
 */
export function todayInBogota(now: Date = new Date()): Date {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const esFinDeSemana = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;

/** El siguiente día hábil estrictamente posterior a `from`. */
export function nextBusinessDay(from: Date): Date {
  const d = new Date(from);
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (esFinDeSemana(d));
  return d;
}

/** Avanza `n` días hábiles desde `from`. */
export function addBusinessDays(from: Date, n: number): Date {
  let d = from;
  for (let i = 0; i < n; i++) d = nextBusinessDay(d);
  return d;
}

/** "viernes 5 de septiembre" (es-CO mete una coma tras el día; sobra aquí). */
export function formatLongDate(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC", // la fecha ya viene anclada a UTC
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(d)
    .replace(",", "");
}

/**
 * "27 Ago" — formato compacto para el paso a paso del checkout.
 *
 * Se arma por partes en vez de formatear la cadena completa: es-CO devuelve
 * "27 de ago." y tanto el "de" como el punto sobran. El mes se recorta a tres
 * letras porque es-CO abrevia septiembre como "sept".
 */
export function formatShortDate(d: Date): string {
  const parts = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).formatToParts(d);

  const dia = parts.find((p) => p.type === "day")?.value ?? "";
  const mes = (parts.find((p) => p.type === "month")?.value ?? "")
    .replace(".", "")
    .slice(0, 3);

  return `${dia} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
}

const UN_DIA_MS = 24 * 60 * 60 * 1000;

export interface DeliveryEstimate {
  /** "mañana" o "el lunes 8 de septiembre" — un viernes no despacha mañana. */
  despacho: string;
  /** "jueves 11 de septiembre" */
  entrega: string;
  diasHabiles: number;
  /** Fechas compactas para el paso a paso: "26 Ago". */
  corto: {
    pedido: string;
    despacho: string;
    entrega: string;
  };
  /** Ventana de llegada, del despacho a la entrega: "27 Ago - 1 Sep". */
  rangoEntrega: string;
}

/**
 * Las dos frases ya listas para pintar. Se calcula en el servidor y se pasa
 * al cliente como texto: si el componente hiciera `new Date()` al renderizar,
 * servidor y navegador podrían caer en días distintos e hidratar distinto.
 */
export function estimateDelivery(now: Date = new Date()): DeliveryEstimate {
  const hoy = todayInBogota(now);
  const despacho = nextBusinessDay(hoy);
  const entrega = addBusinessDays(despacho, DELIVERY_BUSINESS_DAYS);
  const esManana = despacho.getTime() - hoy.getTime() === UN_DIA_MS;

  return {
    despacho: esManana ? "mañana" : `el ${formatLongDate(despacho)}`,
    entrega: formatLongDate(entrega),
    diasHabiles: DELIVERY_BUSINESS_DAYS,
    corto: {
      pedido: formatShortDate(hoy),
      despacho: formatShortDate(despacho),
      entrega: formatShortDate(entrega),
    },
    rangoEntrega: `${formatShortDate(despacho)} - ${formatShortDate(entrega)}`,
  };
}
