import { cn } from "@/lib/utils";

type Corner = "top-right" | "top-left" | "bottom-right" | "bottom-left";

/** Cada esquina define de qué lado sobresale la cinta y hacia qué lado
 * rota, para que la diagonal quede pegada al borde en vez de flotar. */
const cornerStyles: Record<Corner, string> = {
  "top-right": "-right-11 top-5 rotate-45",
  "top-left": "-left-11 top-5 -rotate-45",
  "bottom-right": "-right-11 bottom-5 -rotate-45",
  "bottom-left": "-left-11 bottom-5 rotate-45",
};

/**
 * Cinta diagonal de oferta para la esquina de una imagen de producto.
 * El contenedor padre debe ser `relative overflow-hidden` para recortarla:
 * la cinta se dibuja más ancha que la esquina y queda cortada por ese
 * overflow, que es lo que le da el efecto de banda diagonal.
 */
export function DiscountRibbon({
  pct,
  corner = "top-right",
  size = "md",
  className,
}: {
  pct: number;
  corner?: Corner;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 bg-violeta text-center shadow-md",
        size === "md" ? "w-40 py-1" : "w-28 py-0.5",
        cornerStyles[corner],
        className,
      )}
    >
      <span
        className={cn(
          "font-heading font-bold uppercase tracking-wide text-white",
          size === "md" ? "text-[10px]" : "text-[8px]",
        )}
      >
        ¡Oferta! -{pct}%
      </span>
    </div>
  );
}
