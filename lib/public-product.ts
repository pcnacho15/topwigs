/** Tipos "públicos" (serializables) que consumen los componentes de la
 * tienda. Se derivan del modelo Prisma pero sin acoplarse a él. */

/** Tipo de producto: cada uno tiene su propio catálogo. */
export type ProductTipo = "peluca" | "lente";

export interface PublicColor {
  nombre: string;
  tipo: "solid" | "gradient";
  from: string;
  to: string | null;
}

export interface PublicCategory {
  id: string;
  slug: string;
  nombre: string;
  imagen: string | null;
}

export interface PublicProduct {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precioCop: number;
  precioOfertaCop: number | null;
  tipo: string;
  categoria: { slug: string; nombre: string };
  rating: number;
  reviews: number;
  nuevo: boolean;
  /** true si stock=0 o el admin lo desactivó: sigue visible, pero no se puede comprar. */
  agotado: boolean;
  colores: PublicColor[];
  features: string[];
  imagenes: string[];
  videos: string[];
}

/** CSS de fondo de un color (sólido o degradado). */
export function colorToCss(c: PublicColor): string {
  return c.tipo === "gradient" && c.to
    ? `linear-gradient(135deg, ${c.from}, ${c.to})`
    : c.from;
}

/** Porcentaje de descuento (o null si no hay oferta válida). */
export function descuentoPct(
  precio: number,
  oferta: number | null,
): number | null {
  if (!oferta || oferta >= precio) return null;
  return Math.round((1 - oferta / precio) * 100);
}
