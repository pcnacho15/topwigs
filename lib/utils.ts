import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge agrupa por prefijo: sin esto, "text-glow" (nuestro
 * @utility de text-shadow en globals.css) se confunde con la familia
 * "text-{color}" y termina descartando el color de texto real (p. ej.
 * "text-neon text-glow" se colapsaba a solo "text-glow"). */
const twMerge = extendTailwindMerge<"text-glow">({
  extend: {
    classGroups: {
      "text-glow": ["text-glow", "text-glow-violeta"],
    },
  },
});

/** Une clases con soporte de condicionales (clsx) y resolución de
 * conflictos de Tailwind (tailwind-merge). Estándar de shadcn. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Genera un slug URL-safe a partir de un texto. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Formatea una fecha: 2026-08-17T14:30 → "17 ago 2026, 2:30 p.m." */
export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}
