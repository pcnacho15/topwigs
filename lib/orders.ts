/** Estados posibles de un pedido (igual a `Order.status` en Prisma). */
export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "VOIDED",
  "ERROR",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  DECLINED: "Rechazado",
  VOIDED: "Anulado",
  ERROR: "Error",
};

/** Estado del inventario del pedido (`Order.stockStatus`). */
export const STOCK_STATUS_LABEL: Record<string, string> = {
  RESERVED: "Stock reservado",
  COMMITTED: "Stock descontado",
  RELEASED: "Reserva liberada",
  OVERSOLD: "Sobreventa: sin stock suficiente",
};

export const STOCK_STATUS_COLOR: Record<string, string> = {
  RESERVED: "text-yellow-400",
  COMMITTED: "text-humo",
  RELEASED: "text-humo/60",
  OVERSOLD: "text-red-500 font-bold",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400",
  APPROVED: "text-neon",
  DECLINED: "text-red-500",
  VOIDED: "text-humo/60",
  ERROR: "text-red-500",
};
