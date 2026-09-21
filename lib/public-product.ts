/** Tipos "públicos" (serializables) que consumen los componentes de la
 * tienda. Se derivan del modelo Prisma pero sin acoplarse a él. */

/**
 * Tipo de producto = un catálogo. Ya no es una unión fija: los tipos los crea
 * el admin (modelo `ProductType`), así que el slug es un string cualquiera.
 */
export interface PublicProductType {
  slug: string;
  /** Singular: "Peluca". */
  nombre: string;
  /** Plural, para nav y títulos: "Pelucas". */
  label: string;
  descripcion: string;
}

/** Ruta pública del catálogo de un tipo. */
export function catalogoHref(tipoSlug: string): string {
  return `/${tipoSlug}`;
}

export interface PublicColor {
  nombre: string;
  tipo: "solid" | "gradient";
  from: string;
  to: string | null;
  /** Medios propios de este color (subconjunto de los del producto). */
  imagenes: string[];
  videos: string[];
}

export interface PublicCategory {
  id: string;
  slug: string;
  nombre: string;
  imagen: string | null;
}

/** Categoría + el catálogo al que pertenece (tarjetas del Home). */
export interface PublicCategoryConTipo extends PublicCategory {
  tipo: PublicProductType;
}

export interface PublicProduct {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precioCop: number;
  precioOfertaCop: number | null;
  /** Catálogo al que pertenece, heredado de su categoría. */
  tipo: PublicProductType;
  categoria: { slug: string; nombre: string };
  rating: number;
  reviews: number;
  nuevo: boolean;
  /** true si stock=0 o el admin lo desactivó: sigue visible, pero no se puede comprar. */
  agotado: boolean;
  colores: PublicColor[];
  features: string[];
  tips: string[];
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

/**
 * Precio de oferta a partir de un % de descuento sobre el precio base,
 * redondeado al millar más cercano: 135000 con 15% da 115000, no el
 * 114750 exacto (se ve más "redondo" en la tienda).
 */
export function aplicarDescuentoPct(precio: number, pct: number): number {
  const exacto = precio * (1 - pct / 100);
  return Math.round(exacto / 1000) * 1000;
}
