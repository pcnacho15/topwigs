"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainer, staggerItem, VIEWPORT } from "./variants";

/** Cómo se dispara la animación del contenedor. */
type Trigger = "inView" | "mount";

/**
 * Contenedor que revela a sus hijos en cascada. Envuelve cada hijo en
 * <StaggerItem>.
 *
 * - trigger="inView" (default): revela al entrar en viewport, una vez.
 *   Ideal para secciones estáticas (Home).
 * - trigger="mount": el contenedor queda siempre en estado "show", así
 *   los hijos que se montan después (p. ej. al filtrar una lista) también
 *   animan a visible en vez de quedar atascados en el estado inicial.
 */
export function Stagger({
  children,
  className,
  trigger = "inView",
}: {
  children: ReactNode;
  className?: string;
  trigger?: Trigger;
}) {
  const activation =
    trigger === "mount"
      ? { animate: "show" as const }
      : { whileInView: "show" as const, viewport: VIEWPORT };

  return (
    <m.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      {...activation}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div variants={staggerItem} className={className}>
      {children}
    </m.div>
  );
}
