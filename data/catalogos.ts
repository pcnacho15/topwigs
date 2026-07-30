import type { ProductTipo } from "@/lib/public-product";

interface Catalogo {
  tipo: ProductTipo;
  /** Ruta de la página de catálogo. */
  href: string;
  /** Etiqueta en navbar / footer / breadcrumb. */
  label: string;
  /** Título de la RetroWindow. */
  ventana: string;
  /** Placeholder del buscador. */
  buscar: string;
  descripcion: string;
}

/**
 * Un catálogo por tipo de producto. Centraliza rutas y copy para que el
 * navbar, las páginas y el breadcrumb del producto no se desincronicen.
 */
export const CATALOGOS = {
  peluca: {
    tipo: "peluca",
    href: "/pelucas",
    label: "Pelucas",
    ventana: "pelucas.exe",
    buscar: "Buscar peluca…",
    descripcion:
      "Explora las pelucas TOPWIGS. Fibra seminatural, resistentes al calor.",
  },
  lente: {
    tipo: "lente",
    href: "/lentes",
    label: "Lentes",
    ventana: "lentes.exe",
    buscar: "Buscar lente…",
    descripcion:
      "Lentes de contacto TOPWIGS. Cambia tu mirada, cambia tu vibra.",
  },
} as const satisfies Record<ProductTipo, Catalogo>;

/** Catálogo al que pertenece un producto (cae en pelucas si el tipo es raro). */
export function catalogoDe(tipo: string): Catalogo {
  return CATALOGOS[tipo as ProductTipo] ?? CATALOGOS.peluca;
}
