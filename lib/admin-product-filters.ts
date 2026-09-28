/**
 * Filtros de la tabla de productos del admin. Viven en la URL
 * (`/admin/productos?tipo=…&stock=con…`) para que sobrevivan a la
 * paginación y al recargar; este módulo los lee y los vuelve a escribir, y lo
 * usan tanto la página (servidor) como la barra de filtros (cliente).
 */

export type SiNo = "si" | "no";

export type ProductFilters = {
  q: string;
  tipo: string; // id de ProductType
  categoria: string; // id de Category
  min: string; // precio efectivo mínimo (COP)
  max: string; // precio efectivo máximo (COP)
  stock: "" | "con" | "sin";
  estado: "" | "disponible" | "agotado";
  nuevo: "" | SiNo;
  vendido: "" | SiNo; // en "Lo más vendido" (marcado y disponible)
};

export const EMPTY_FILTERS: ProductFilters = {
  q: "",
  tipo: "",
  categoria: "",
  min: "",
  max: "",
  stock: "",
  estado: "",
  nuevo: "",
  vendido: "",
};

const oneOf = <T extends string>(v: string | undefined, opts: readonly T[]): T | "" =>
  opts.includes(v as T) ? (v as T) : "";

const price = (v: string | undefined) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? String(Math.floor(n)) : "";
};

export function parseProductFilters(
  sp: Record<string, string | string[] | undefined>,
): ProductFilters {
  const get = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  return {
    q: get("q") ?? "",
    tipo: get("tipo") ?? "",
    categoria: get("categoria") ?? "",
    min: price(get("min")),
    max: price(get("max")),
    stock: oneOf(get("stock"), ["con", "sin"] as const),
    estado: oneOf(get("estado"), ["disponible", "agotado"] as const),
    nuevo: oneOf(get("nuevo"), ["si", "no"] as const),
    vendido: oneOf(get("vendido"), ["si", "no"] as const),
  };
}

export function hasActiveFilters(f: ProductFilters): boolean {
  return Object.values(f).some((v) => v.trim() !== "");
}

/** URL de la tabla con esos filtros; sin `page`, vuelve a la página 1. */
export function productFiltersHref(f: ProductFilters, page?: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v.trim()) params.set(k, v.trim());
  }
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/productos?${qs}` : "/admin/productos";
}
