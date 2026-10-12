"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PublicCategoriaFicha } from "@/lib/public-product";
import { RetroWindow } from "@/components/ui/retro-window";
import { Sparkle } from "@/components/icons";
import { cn } from "@/lib/utils";

/** ① ② ③ … — la numeración sale del orden, no se guarda (máx. 10). */
const numero = (i: number) => String.fromCodePoint(0x2460 + i);

/**
 * Botón "Ver características" + modal con la ficha informativa de una
 * categoría. No pinta nada si la categoría no tiene características, así
 * se puede poner en cualquier lado sin preguntar antes.
 *
 * Usa `<dialog>` nativo: el navegador ya resuelve Escape, el foco y la capa
 * superior (queda por encima del navbar sin pelear con z-index).
 */
export function CategoryInfo({
  ficha,
  label = "Ver características",
  variant = "chip",
  className,
}: {
  ficha: PublicCategoriaFicha;
  label?: string;
  /** `chip`: botón pequeño con borde. `link`: texto subrayado. */
  variant?: "chip" | "link";
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);

  // Bloquea el scroll de la página mientras el modal está abierto.
  useEffect(() => {
    if (!abierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  if (ficha.caracteristicas.length === 0) return null;

  const abrir = () => {
    dialogRef.current?.showModal();
    setAbierto(true);
  };
  const cerrar = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 font-heading text-xs font-semibold uppercase tracking-wide transition-colors",
          variant === "chip"
            ? "rounded-full border border-neon/40 px-3 py-1.5 text-humo hover:border-neon hover:text-neon"
            : "text-neon underline underline-offset-4 hover:text-neon-soft",
          className,
        )}
      >
        <Sparkle className="size-3.5" aria-hidden />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Características de ${ficha.nombre}`}
        onClose={() => setAbierto(false)}
        // Clic en el fondo (fuera de la ventana) cierra el modal.
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrar();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl bg-transparent p-0 text-blanco backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <RetroWindow title="ficha.exe">
          <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-extrabold uppercase text-glow">
                  {ficha.nombre}
                </h2>
                {ficha.resumen ? (
                  <p className="text-sm text-humo">{ficha.resumen}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="cursor-pointer text-2xl leading-none text-humo transition-colors hover:text-neon"
              >
                ✕
              </button>
            </div>

            <ol className="space-y-8">
              {ficha.caracteristicas.map((c, i) => (
                <li key={`${c.titulo}-${i}`} className="space-y-3">
                  <h3 className="flex items-baseline gap-2 font-heading text-lg font-bold uppercase tracking-wide">
                    <span className="text-neon" aria-hidden>
                      {numero(i)}
                    </span>
                    {c.titulo}
                  </h3>
                  {c.imagen ? (
                    <figure className="space-y-1.5">
                      <div className="overflow-hidden rounded-goth border border-linea bg-surface-2">
                        <Image
                          src={c.imagen}
                          alt={c.pieImagen || c.titulo}
                          width={800}
                          height={600}
                          sizes="(max-width: 672px) 100vw, 640px"
                          className="h-auto w-full"
                        />
                      </div>
                      {c.pieImagen ? (
                        <figcaption className="text-center text-xs text-humo/80">
                          {c.pieImagen}
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null}
                  {c.puntos.length > 0 ? (
                    <ul className="space-y-1.5 text-sm text-humo">
                      {c.puntos.map((p, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-neon" aria-hidden>
                            ✦
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </RetroWindow>
      </dialog>
    </>
  );
}
