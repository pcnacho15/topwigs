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

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400",
  APPROVED: "text-neon",
  DECLINED: "text-red-500",
  VOIDED: "text-humo/60",
  ERROR: "text-red-500",
};
