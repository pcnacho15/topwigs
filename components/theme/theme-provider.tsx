"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "topwigs-theme";
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

/** Coincide con el fallback del script inline en app/layout.tsx, para que
 * la hidratación no choque con lo que ya pintó el servidor. */
function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function applyTheme(next: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Almacenamiento no disponible (privado/bloqueado): el toggle sigue
    // funcionando en la sesión actual, solo no persiste.
  }
  listeners.forEach((onChange) => onChange());
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

/**
 * Contexto de tema claro/oscuro. La clase real en <html> la fija un script
 * inline (ver app/layout.tsx) antes de la hidratación para evitar flash;
 * este provider lee esa clase vía useSyncExternalStore (no useEffect, para
 * no forzar un set-state síncrono al montar) y expone el toggle.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
