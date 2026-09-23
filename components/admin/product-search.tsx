"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/shadcn/input";

const DEBOUNCE_MS = 300;

export function ProductSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const lastSent = useRef(initialQuery);

  // Busca a medida que se escribe; cada búsqueda nueva vuelve a la página 1.
  useEffect(() => {
    const q = query.trim();
    if (q === lastSent.current) return;
    const id = setTimeout(() => {
      lastSent.current = q;
      const href = q ? `/admin/productos?q=${encodeURIComponent(q)}` : "/admin/productos";
      startTransition(() => router.replace(href, { scroll: false }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query, router]);

  return (
    <label className="relative block w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-humo" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre…"
        aria-label="Buscar producto por nombre"
        className="pl-9 pr-9"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-humo" />
      ) : null}
    </label>
  );
}
