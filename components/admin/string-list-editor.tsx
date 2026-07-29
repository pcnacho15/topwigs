"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";

/** Editor de lista de strings (p. ej. features del producto). */
export function StringListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="size-4" />
        </Button>
      </div>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((f, i) => (
            <li
              key={`${f}-${i}`}
              className="flex items-center gap-2 rounded-full border border-linea px-3 py-1 text-sm text-humo"
            >
              {f}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label={`Quitar ${f}`}
                className="text-humo transition-colors hover:text-red-500"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
