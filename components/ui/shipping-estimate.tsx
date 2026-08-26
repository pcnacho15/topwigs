import type { DeliveryEstimate } from "@/lib/delivery";
import { Package, Truck } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Tarjeta con los tiempos de envío: cuándo se despacha y cuándo llega.
 *
 * Solo pinta: recibe las frases ya calculadas en el servidor
 * (`estimateDelivery`), porque calcular la fecha al renderizar haría que
 * servidor y navegador pudieran caer en días distintos.
 */
export function ShippingEstimate({
  estimate,
  contexto = "producto",
  className,
}: {
  estimate: DeliveryEstimate;
  /** En el checkout el despacho ya depende del pago, y se dice así. */
  contexto?: "producto" | "checkout";
  className?: string;
}) {
  const despacho =
    contexto === "checkout"
      ? `Apenas confirmemos tu pago, tu pedido se despacha ${estimate.despacho}.`
      : `Tu pedido se despacha ${estimate.despacho}.`;

  return (
    <div
      className={cn(
        "rounded-goth border border-neon/40 bg-surface-1/80 p-4 shadow-[0_0_24px_-10px_rgba(255,47,146,0.65)] backdrop-blur-sm",
        className,
      )}
    >
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <Package className="mt-0.5 shrink-0 text-base text-neon" />
          <p className="text-sm leading-snug text-humo">{despacho}</p>
        </li>
        <li className="flex items-start gap-3">
          <Truck className="mt-0.5 shrink-0 text-base text-neon" />
          <p className="text-sm leading-snug text-humo">
            Llega a tu domicilio{" "}
            <span className="font-semibold text-blanco">
              {estimate.diasHabiles} días hábiles
            </span>{" "}
            después del despacho, aprox. el{" "}
            <span className="font-semibold text-blanco">
              {estimate.entrega}
            </span>
            .
          </p>
        </li>
      </ul>
      <p className="mt-3 border-t border-linea pt-2 text-[12px] leading-snug text-humo/60">
        Envíos con <span className="font-semibold">INTERRAPIDÍSIMO</span> a toda Colombia. Rastreo en
        línea y seguro de transporte incluido.
      </p>
    </div>
  );
}
