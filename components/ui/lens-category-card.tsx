import Link from "next/link";
import Image from "next/image";

/**
 * Colores aproximados para pintar el iris cuando la categoría todavía no tiene
 * imagen de portada. Las categorías de lentes se nombran por color ("Azul",
 * "Rosado", "Blue"…), así que basta con reconocer el nombre; cualquier otro
 * cae al degradado de marca.
 */
const COLOR_POR_NOMBRE: Record<string, string> = {
  azul: "#5a86c7",
  blue: "#5a86c7",
  celeste: "#7fc4e8",
  gris: "#8a8f98",
  grey: "#8a8f98",
  gray: "#8a8f98",
  verde: "#5ac79a",
  green: "#5ac79a",
  miel: "#c9a24a",
  cafe: "#8a5a34",
  café: "#8a5a34",
  marron: "#8a5a34",
  marrón: "#8a5a34",
  brown: "#8a5a34",
  morado: "#8a5ac7",
  violeta: "#8a5ac7",
  purple: "#8a5ac7",
  rosado: "#ff7ab8",
  rosa: "#ff7ab8",
  pink: "#ff7ab8",
  rojo: "#c73b3b",
  red: "#c73b3b",
  negro: "#2a2a33",
  black: "#2a2a33",
  blanco: "#d8d8e0",
  white: "#d8d8e0",
  amarillo: "#d8c14a",
  naranja: "#d8834a",
};

function irisBackground(nombre: string): string {
  const hex = COLOR_POR_NOMBRE[nombre.trim().toLowerCase()];
  return hex
    ? `radial-gradient(circle at 50% 40%, ${hex}, var(--color-surface-3) 78%)`
    : "radial-gradient(circle at 50% 40%, rgba(186,43,226,0.9), rgba(255,47,146,0.5) 45%, var(--color-surface-3) 80%)";
}

/**
 * Tarjeta de categoría de lentes (Home): un iris circular con el nombre del
 * color. Enlaza al catálogo de lentes ya filtrado por esa categoría.
 */
export function LensCategoryCard({
  categoria,
  catalogo,
}: {
  categoria: { slug: string; nombre: string; imagen: string | null };
  /** Ruta del catálogo de lentes (p. ej. `/lentes`). */
  catalogo: string;
}) {
  return (
    <Link
      href={`${catalogo}?categoria=${categoria.slug}`}
      className="group flex flex-col items-center gap-3 text-center"
    >
      <span
        className="relative block aspect-square w-full max-w-32 overflow-hidden rounded-full ring-2 ring-neon/40 transition-all duration-300 group-hover:scale-105 group-hover:ring-neon group-hover:shadow-[0_0_28px_-4px_rgba(255,47,146,0.7)]"
        style={
          categoria.imagen ? undefined : { background: irisBackground(categoria.nombre) }
        }
      >
        {categoria.imagen ? (
          <Image
            src={categoria.imagen}
            alt={`Lentes ${categoria.nombre}`}
            fill
            sizes="(max-width: 640px) 40vw, 128px"
            className="object-cover"
          />
        ) : null}
      </span>
      <h3 className="font-heading text-xs font-bold uppercase tracking-wide transition-colors group-hover:text-neon">
        {categoria.nombre}
      </h3>
    </Link>
  );
}
