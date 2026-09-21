import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Contenedor base de tarjeta (categorías, productos, features).
 * `glow` activa el resplandor neón en hover.
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ glow = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-200 rounded-sm",
        // glow &&
        //   "hover:border-neon/60 hover:shadow-[0_0_24px_-6px_rgba(255,47,146,0.5)]",
        className,
      )}
      {...props}
    />
  );
}
