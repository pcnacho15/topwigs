import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-goth border border-linea bg-surface-1 px-4 py-3 text-sm text-blanco " +
  "placeholder:text-humo/60 transition-colors focus:border-neon focus:outline-none";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldBase, "min-h-28 resize-y", className)} {...props} />
  );
}

/** Etiqueta de campo consistente con la marca. */
export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-wide text-humo"
    >
      {children}
    </label>
  );
}
