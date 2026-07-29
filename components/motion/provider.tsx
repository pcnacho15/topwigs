"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Provee el contexto de Motion a toda la app:
 *  - LazyMotion(domAnimation, strict): carga solo las features DOM (~animaciones
 *    + gestos hover/tap/focus + whileInView) y obliga a usar `m` en vez de
 *    `motion` para mantener el bundle pequeño.
 *  - MotionConfig reducedMotion="user": respeta prefers-reduced-motion
 *    (desactiva desplazamientos; conserva fades suaves).
 * Es un Client Component que envuelve children que siguen siendo Server.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
