"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 2000;

/**
 * Fila horizontal con scroll-snap: en mobile se desliza con el dedo
 * (scroll nativo), en desktop además hay flechas. Avanza sola una tarjeta
 * cada 2s (y vuelve al inicio al llegar al final); se pausa mientras el
 * cursor está encima o el dedo la está tocando, para no pelear con el
 * usuario si está mirando o deslizando a mano.
 */
export function Carousel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  /** Ancho de una tarjeta + su gap, medido en el DOM (varía por breakpoint). */
  const stepWidth = (el: HTMLDivElement) => {
    const first = el.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 16 : el.clientWidth * 0.9;
  };

  const advance = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: dir * stepWidth(el), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => advance(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, advance]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={ref}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => advance(-1)}
        aria-label="Ver anteriores"
        className="absolute left-0 top-1/2 hidden size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-linea bg-surface-1 text-humo transition-colors hover:text-neon sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => advance(1)}
        aria-label="Ver siguientes"
        className="absolute right-0 top-1/2 hidden size-9 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-linea bg-surface-1 text-humo transition-colors hover:text-neon sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/** Un ítem del carrusel: ancho fijo por breakpoint + punto de snap. */
export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%]", className)}>
      {children}
    </div>
  );
}
