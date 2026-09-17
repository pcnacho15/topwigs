"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Sun, Moon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Interruptor de tema claro/oscuro. Muestra el icono del modo al que se
 * cambiaría al pulsar (sol en oscuro, luna en claro).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      className={cn(
        "grid place-items-center transition-colors hover:text-neon cursor-pointer",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
