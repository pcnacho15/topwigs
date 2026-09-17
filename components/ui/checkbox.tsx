import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Texto principal, clicable junto a la casilla. */
  label: ReactNode;
  /** Aclaración secundaria bajo la etiqueta. */
  hint?: ReactNode;
}

/**
 * Casilla nativa con apariencia de marca (el `input` real se mantiene para
 * conservar teclado, foco y lectores de pantalla; solo se repinta).
 */
export function Checkbox({
  id,
  label,
  hint,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-goth border border-linea",
        "bg-surface-1 p-4 transition-colors hover:border-neon/50",
        className,
      )}
    >
      <span className="relative mt-0.5 grid shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-[0.35rem] border border-linea",
            "bg-surface-2 transition-colors checked:border-neon checked:bg-neon",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/60",
          )}
          {...props}
        />
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="pointer-events-none absolute size-3.5 text-ink opacity-0 transition-opacity peer-checked:opacity-100"
        >
          <path
            d="M3 8.5l3.2 3.2L13 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-sm font-semibold uppercase tracking-wide text-blanco">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs text-humo">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}
