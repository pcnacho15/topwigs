"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

/** Línea del carrito (una peluca en un color concreto). */
export interface CartItem {
  id: string; // `${slug}::${colorNombre}`
  slug: string;
  nombre: string;
  precio: number; // COP unitario
  colorNombre: string;
  colorHex: string;
  /** Portada de la línea. Opcional: los carritos guardados antes de este
   * campo no la traen y caen al swatch de color. */
  imagen?: string;
  qty: number;
}

const STORAGE_KEY = "topwigs.cart";
const STORAGE_VERSION = 1;
const MAX_QTY = 99;

export const lineId = (slug: string, colorNombre: string) =>
  `${slug}::${colorNombre}`;

type Action =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id
            ? { ...i, qty: Math.min(MAX_QTY, i.qty + action.item.qty) }
            : i,
        );
      }
      return [...state, action.item];
    }
    case "SET_QTY": {
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) =>
        i.id === action.id
          ? { ...i, qty: Math.min(MAX_QTY, action.qty) }
          : i,
      );
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  add: (item: Omit<CartItem, "id" | "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Empezamos vacío en SSR y en el primer render de cliente (evita mismatch
  // de hidratación); cargamos de localStorage tras montar.
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.v === STORAGE_VERSION && Array.isArray(parsed.items)) {
          dispatch({ type: "HYDRATE", items: parsed.items });
        }
      }
    } catch {
      // storage corrupto o no disponible: ignorar
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: STORAGE_VERSION, items }),
      );
    } catch {
      // sin persistencia
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.precio * i.qty, 0);
    return {
      items,
      totalItems,
      subtotal,
      isOpen,
      hydrated,
      add: (item, qty = 1) =>
        dispatch({
          type: "ADD",
          item: { ...item, id: lineId(item.slug, item.colorNombre), qty },
        }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      clear: () => dispatch({ type: "CLEAR" }),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
