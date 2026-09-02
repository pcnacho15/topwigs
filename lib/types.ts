/** Categorías de pelucas (coinciden con los filtros del catálogo). */
export type CategoriaSlug = "rubias" | "negras" | "fantasia" | "cosplay";

export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
}

/** Color disponible de un producto (swatch). */
export interface ColorOpcion {
  nombre: string;
  hex: string;
}

/** Peluca. */
export interface Wig {
  slug: string;
  nombre: string;
  precio: number; // en COP
  categoria: CategoriaSlug;
  rating: number; // 0–5
  reviews: number;
  colores: ColorOpcion[];
  descripcion: string;
  features: string[];
  nuevo?: boolean;
}
