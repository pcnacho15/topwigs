"use client";

import { useMemo, useState } from "react";
import type { PublicProduct, PublicCategory } from "@/lib/public-product";
import { ProductCard } from "@/components/ui/product-card";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Search, ChevronLeft, ChevronRight, HeartDrip } from "@/components/icons";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

/** Normaliza para búsqueda insensible a mayúsculas y acentos. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function CatalogView({
  titulo,
  ventana,
  buscar,
  productos,
  categorias,
  initialCategoria,
}: {
  /** Encabezado de la página (p. ej. "Pelucas"). */
  titulo: string;
  /** Título de la RetroWindow (p. ej. "pelucas.exe"). */
  ventana: string;
  /** Placeholder del buscador. */
  buscar: string;
  productos: PublicProduct[];
  categorias: PublicCategory[];
  initialCategoria: string;
}) {
  const [categoria, setCategoria] = useState<string>(initialCategoria);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const tabs = useMemo(
    () => [
      { slug: "todas", label: "Todas" },
      ...categorias.map((c) => ({ slug: c.slug, label: c.nombre })),
    ],
    [categorias],
  );

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return productos.filter(
      (p) =>
        (categoria === "todas" || p.categoria.slug === categoria) &&
        (q === "" || norm(p.nombre).includes(q)),
    );
  }, [productos, categoria, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const selectCategoria = (s: string) => {
    setCategoria(s);
    setPage(0);
  };
  const onSearch = (v: string) => {
    setQuery(v);
    setPage(0);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <Reveal className="mb-8 flex justify-center">
        <SectionHeading>{titulo}</SectionHeading>
      </Reveal>

      <Reveal>
        <RetroWindow title={ventana}>
          <div className="space-y-6 p-5 sm:p-8">
            {/* Filtros + búsqueda */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => selectCategoria(t.slug)}
                    aria-pressed={categoria === t.slug}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-1.5 font-heading text-xs font-semibold uppercase tracking-wide transition-colors",
                      categoria === t.slug
                        ? "bg-neon text-noir"
                        : "border border-neon/40 text-humo hover:border-neon hover:text-neon",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="relative w-full lg:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-humo" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder={buscar}
                  className="w-full rounded-goth border border-linea bg-surface-1 py-2.5 pl-9 pr-3 text-sm text-blanco placeholder:text-humo/60 focus:border-neon focus:outline-none"
                />
              </label>
            </div>

            {/* Conteo de resultados */}
            <p className="font-pixel text-[10px] uppercase tracking-widest text-humo/70">
              {filtered.length}{" "}
              {filtered.length === 1 ? "producto" : "productos"}
            </p>

            {/* Grid / vacío */}
            {visible.length > 0 ? (
              <Stagger
                trigger="mount"
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              >
                {visible.map((p) => (
                  <StaggerItem key={p.slug}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <HeartDrip className="size-10 text-neon/50" />
                <p className="font-heading uppercase tracking-wide text-humo">
                  Sin resultados
                </p>
                <p className="text-sm text-humo/70">
                  Prueba con otra categoría o término de búsqueda.
                </p>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  aria-label="Página anterior"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                  className="grid size-8 cursor-pointer place-items-center rounded-full border border-neon/40 text-humo transition-colors hover:text-neon disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-current={i === current}
                    className={cn(
                      "grid size-8 cursor-pointer place-items-center rounded-full font-heading text-sm transition-colors",
                      i === current
                        ? "bg-neon text-noir"
                        : "border border-neon/40 text-humo hover:text-neon",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="Página siguiente"
                  disabled={current === totalPages - 1}
                  onClick={() => setPage(current + 1)}
                  className="grid size-8 cursor-pointer place-items-center rounded-full border border-neon/40 text-humo transition-colors hover:text-neon disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        </RetroWindow>
      </Reveal>
    </main>
  );
}
