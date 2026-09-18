import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Acordeón nativo (<details>/<summary>): no necesita JS ni "use client",
 * funciona server-rendered y es accesible por defecto (teclado, lectores
 * de pantalla).
 */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      className={cn(
        "group border-b border-linea py-4 first:pt-0 last:border-b-0 last:pb-0",
        className,
      )}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading text-sm font-bold uppercase tracking-wide text-blanco [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 shrink-0 text-humo transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pt-3 text-sm leading-relaxed text-humo">{children}</div>
    </details>
  );
}
