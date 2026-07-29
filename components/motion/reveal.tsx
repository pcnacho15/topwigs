"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, VIEWPORT } from "./variants";

/**
 * Revela su contenido con un fade + leve subida al entrar en viewport
 * (una sola vez). Los children siguen siendo Server Components.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...EASE_OUT, delay }}
    >
      {children}
    </m.div>
  );
}
