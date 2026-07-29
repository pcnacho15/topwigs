import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marco tipo "ventana de sistema operativo" Y2K: barra de título con
 * puntos de semáforo + botones minimizar/maximizar/cerrar. Es el motivo
 * central de la plantilla; envuelve secciones y tarjetas destacadas.
 */
interface RetroWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Contenido opcional a la izquierda de la barra (p. ej. el logo). */
  titleLeft?: ReactNode;
}

export function RetroWindow({
  title,
  titleLeft,
  children,
  className,
}: RetroWindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-goth border border-neon/40 bg-surface-1",
        "shadow-[0_0_30px_-8px_rgba(255,47,146,0.35)]",
        className,
      )}
    >
      {/* Barra de título */}
      <div className="flex items-center gap-3 border-b border-neon/30 bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-3 rounded-full border border-neon/60" />
          <span className="size-3 rounded-full border border-neon/60" />
          <span className="size-3 rounded-full border border-neon/60" />
        </div>
        {titleLeft}
        {title ? (
          <span className="font-pixel text-[10px] leading-none text-humo">
            {title}
          </span>
        ) : null}
        {/* Controles a la derecha */}
        <div className="ml-auto flex items-center gap-3 text-neon/70" aria-hidden>
          <Glyph>—</Glyph>
          <Glyph>▢</Glyph>
          <Glyph>✕</Glyph>
        </div>
      </div>
      {children}
    </div>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return <span className="text-xs leading-none">{children}</span>;
}
