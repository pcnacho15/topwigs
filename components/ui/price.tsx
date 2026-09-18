import { cn } from "@/lib/utils";

// Un único formateador reutilizado en todos los renders (crear
// Intl.NumberFormat es costoso y PriceTag se usa en muchas tarjetas).
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formatea un número a pesos colombianos: 160000 → "$160.000". */
export function formatCOP(value: number): string {
  return copFormatter.format(value);
}

interface PriceTagProps {
  value: number;
  /** Muestra el sufijo "COP". */
  showCurrency?: boolean;
  className?: string;
}

export function PriceTag({ value, showCurrency, className }: PriceTagProps) {
  return (
    <span className={cn("font-heading font-bold text-blanco", className)}>
      {formatCOP(value)}
      {/* {showCurrency && <span className="ml-1 text-humo">COP</span>} */}
    </span>
  );
}
