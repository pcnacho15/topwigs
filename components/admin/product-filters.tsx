"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  productFiltersHref,
  type ProductFilters,
} from "@/lib/admin-product-filters";

const DEBOUNCE_MS = 300;
// Radix Select no admite "" como valor de un ítem.
const TODOS = "todos";

type Option = { value: string; label: string };

function FilterSelect({
  value,
  onChange,
  todos,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  todos: string;
  options: Option[];
}) {
  return (
    <Select value={value || TODOS} onValueChange={(v) => onChange(v === TODOS ? "" : v)}>
      <SelectTrigger aria-label={todos}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{todos}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ProductFiltersBar({
  initial,
  tipos,
  categorias,
  total,
}: {
  initial: ProductFilters;
  tipos: { id: string; label: string }[];
  categorias: { id: string; nombre: string; tipoId: string }[];
  total: number;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastHref = useRef(productFiltersHref(initial));

  function navigate(next: ProductFilters) {
    const href = productFiltersHref(next);
    if (href === lastHref.current) return;
    lastHref.current = href;
    startTransition(() => router.replace(href, { scroll: false }));
  }

  /** Los campos de texto esperan a que se deje de escribir; los selects no. */
  function update(patch: Partial<ProductFilters>, debounce = false) {
    const next = { ...filters, ...patch };
    setFilters(next);
    clearTimeout(timer.current);
    if (debounce) timer.current = setTimeout(() => navigate(next), DEBOUNCE_MS);
    else navigate(next);
  }

  const categoriasVisibles = filters.tipo
    ? categorias.filter((c) => c.tipoId === filters.tipo)
    : categorias;

  function cambiarTipo(tipo: string) {
    // Si la categoría elegida no es de ese tipo, deja de tener sentido.
    const sigue = categorias.some((c) => c.id === filters.categoria && c.tipoId === tipo);
    update({ tipo, categoria: !tipo || sigue ? filters.categoria : "" });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-humo" />
          <Input
            type="search"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value }, true)}
            placeholder="Buscar por nombre…"
            aria-label="Buscar producto por nombre"
            className="pl-9 pr-9"
          />
          {isPending ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-humo" />
          ) : null}
        </label>
        <span className="text-sm text-humo">
          {total} {total === 1 ? "producto" : "productos"}
        </span>
        {hasActiveFilters(filters) ? (
          <Button variant="ghost" size="sm" onClick={() => update(EMPTY_FILTERS)}>
            <X className="size-4" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          value={filters.tipo}
          onChange={cambiarTipo}
          todos="Todos los tipos"
          options={tipos.map((t) => ({ value: t.id, label: t.label }))}
        />
        <FilterSelect
          value={filters.categoria}
          onChange={(categoria) => update({ categoria })}
          todos="Todas las categorías"
          options={categoriasVisibles.map((c) => ({ value: c.id, label: c.nombre }))}
        />
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={filters.min}
          onChange={(e) => update({ min: e.target.value }, true)}
          placeholder="Precio mínimo"
          aria-label="Precio mínimo (COP)"
        />
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={filters.max}
          onChange={(e) => update({ max: e.target.value }, true)}
          placeholder="Precio máximo"
          aria-label="Precio máximo (COP)"
        />
        <FilterSelect
          value={filters.stock}
          onChange={(stock) => update({ stock: stock as ProductFilters["stock"] })}
          todos="Stock: todos"
          options={[
            { value: "con", label: "Con stock" },
            { value: "sin", label: "Sin stock" },
          ]}
        />
        <FilterSelect
          value={filters.estado}
          onChange={(estado) => update({ estado: estado as ProductFilters["estado"] })}
          todos="Estado: todos"
          options={[
            { value: "disponible", label: "Disponible" },
            { value: "agotado", label: "Agotado" },
          ]}
        />
        <FilterSelect
          value={filters.nuevo}
          onChange={(nuevo) => update({ nuevo: nuevo as ProductFilters["nuevo"] })}
          todos="Nuevos: todos"
          options={[
            { value: "si", label: "Solo nuevos" },
            { value: "no", label: "No nuevos" },
          ]}
        />
        <FilterSelect
          value={filters.vendido}
          onChange={(vendido) => update({ vendido: vendido as ProductFilters["vendido"] })}
          todos="Más vendidos: todos"
          options={[
            { value: "si", label: "En más vendidos" },
            { value: "no", label: "Fuera de más vendidos" },
          ]}
        />
      </div>
    </div>
  );
}
