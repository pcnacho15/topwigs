import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neon" | "violeta" | "outline" | "agotado";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neon: "bg-neon text-noir",
  violeta: "bg-violeta text-blanco",
  outline: "border border-neon/60 text-neon",
  agotado: "border border-linea bg-noir/80 text-humo",
};

/** Etiqueta corta: filtros, "NUEVO", categorías. */
export function Badge({ tone = "neon", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1",
        "font-heading text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
