import type { DeliveryEstimate } from "@/lib/delivery";
import { Cart, Truck, MapPin } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Línea de tiempo del envío para el checkout: pedido → despacho → entrega.
 *
 * Recibe las fechas ya calculadas (`estimateDelivery`) y solo pinta. En
 * pantallas anchas los tres pasos van en fila unidos por una línea; en móvil
 * se apilan en columna, unidos en vertical.
 */
export function ShippingSteps({
  estimate,
  className,
}: {
  estimate: DeliveryEstimate;
  className?: string;
}) {
  const pasos = [
    {
      Icon: Cart,
      titulo: "Pedido",
      detalle: estimate.corto.pedido,
      nota: "Hoy, al confirmar el pago",
    },
    {
      Icon: Truck,
      titulo: "Despacho",
      detalle: estimate.corto.despacho,
      nota: "Sale de nuestra bodega",
    },
    {
      Icon: MapPin,
      titulo: "En tus manos",
      detalle: estimate.rangoEntrega,
      nota: `Aprox. ${estimate.diasHabiles} días hábiles`,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-goth border border-neon/40 bg-surface-1/80 p-4 shadow-[0_0_24px_-10px_rgba(255,47,146,0.65)] backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-glow">
        Tu pedido se despacha {estimate.despacho}
      </h3>

      <ol className="mt-4 flex flex-col gap-0 sm:flex-row">
        {pasos.map(({ Icon, titulo, detalle, nota }, i) => (
          <li
            key={titulo}
            className="relative flex flex-1 gap-3 pb-5 last:pb-0 sm:flex-col sm:gap-0 sm:pb-0"
          >
            {/* Conector: vertical en móvil, horizontal en escritorio. No se
                dibuja después del último paso. */}
            {i < pasos.length - 1 ? (
              <span
                aria-hidden
                className="absolute left-4 top-9 h-[calc(100%-1.5rem)] w-px bg-neon/30 sm:left-auto sm:top-4 sm:h-px sm:w-[calc(100%-2.5rem)] sm:translate-x-10"
              />
            ) : null}

            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-neon/50 bg-surface-2 text-neon">
              <Icon className="text-base" />
            </span>

            <div className="sm:mt-3 sm:pr-4">
              <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-humo">
                {titulo}
              </p>
              <p className="font-heading text-sm font-bold text-blanco">
                {detalle}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-humo/70">
                {nota}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-linea pt-5 text-[12px] text-center leading-snug text-humo/60">
        Envíos con <span className="font-semibold">INTERRAPIDÍSIMO</span> a toda
        Colombia.
      </p>
    </div>
  );
}
