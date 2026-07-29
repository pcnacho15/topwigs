import type { Variants, Transition } from "motion/react";

/** Curva y duración base compartidas (movimientos cortos, ease-out). */
export const EASE_OUT: Transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

/** Fade + leve subida. Uso general (títulos, bloques). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: EASE_OUT },
};

/** Contenedor que escalona la aparición de sus hijos. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Item hijo de un contenedor con stagger. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: EASE_OUT },
};

/** Viewport compartido: dispara una vez, un poco antes de entrar del todo. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;
