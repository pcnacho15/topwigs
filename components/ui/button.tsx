import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  // Relleno neón con resplandor
  primary:
    "bg-neon text-ink font-semibold shadow-[0_0_18px_-2px_rgba(255,47,146,0.6)] hover:bg-neon-soft hover:shadow-[0_0_26px_-2px_rgba(255,47,146,0.8)]",
  // Contorno neón sobre transparente
  outline:
    "border border-neon/70 text-neon hover:bg-neon/10 hover:border-neon",
  // Sin borde, texto claro
  ghost: "text-humo hover:text-blanco hover:bg-linea/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-wide",
        "font-heading transition-all duration-200 cursor-pointer",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
