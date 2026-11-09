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
import { getCartStock } from "@/components/cart/actions";
import { readPendingCheckout } from "@/lib/pending-checkout";

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
  /** Stock del PRODUCTO (compartido por todos sus colores). Opcional: los
   * carritos guardados antes de este campo no lo traen hasta sincronizar
   * con el servidor al cargar. */
  stock?: number;
  qty: number;
}

/** slug → unidades disponibles. */
export type StockMap = Record<string, number>;

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
  | { type: "SYNC_STOCK"; stock: StockMap }
  | { type: "CLEAR" };

/** Unidades de un producto en el carrito, sumando todos sus colores. */
function qtyOf(state: CartItem[], slug: string, exceptId?: string): number {
  return state.reduce(
    (n, i) => (i.slug === slug && i.id !== exceptId ? n + i.qty : n),
    0,
  );
}

/**
 * Cantidad máxima que puede tener la línea `id` sin que el producto pase
 * de su stock (los otros colores del mismo producto ya ocupan una parte).
 */
function capFor(state: CartItem[], slug: string, id: string): number {
  const stock = state.find((i) => i.slug === slug)?.stock;
  if (stock == null) return MAX_QTY;
  return Math.max(0, Math.min(MAX_QTY, stock - qtyOf(state, slug, id)));
}

/**
 * Aplica un stock nuevo: lo guarda en las líneas y recorta cantidades en
 * orden (las primeras líneas conservan sus unidades). Las que quedan en 0
 * se eliminan.
 */
function applyStock(state: CartItem[], stock: StockMap): CartItem[] {
  const restante: StockMap = {};
  const next: CartItem[] = [];
  for (const item of state) {
    if (!(item.slug in stock)) {
      next.push(item);
      continue;
    }
    const left = restante[item.slug] ?? Math.max(0, stock[item.slug]);
    const qty = Math.min(item.qty, left);
    restante[item.slug] = left - qty;
    if (qty > 0) next.push({ ...item, stock: stock[item.slug], qty });
  }
  return next;
}

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const { item } = action;
      // Se propaga el stock a todas las líneas del producto antes de
      // calcular el tope. Si el carrito ya conoce uno mayor (sincronizado
      // con el servidor, que suma la reserva propia de un checkout sin
      // pagar) se respeta ese: la ficha no la conoce y recortaría unidades
      // que esta persona ya tiene apartadas. El checkout revalida igual.
      const known = state.find((i) => i.slug === item.slug)?.stock;
      const stock =
        item.stock == null
          ? known
          : known == null
            ? item.stock
            : Math.max(known, item.stock);
      const base =
        stock != null ? applyStock(state, { [item.slug]: stock }) : state;
      const existing = base.find((i) => i.id === item.id);
      const withLine = existing ? base : [...base, { ...item, qty: 0 }];
      const qty = Math.min(
        capFor(withLine, item.slug, item.id),
        (existing?.qty ?? 0) + item.qty,
      );
      if (qty <= 0) return base;
      return withLine.map((i) => (i.id === item.id ? { ...i, qty } : i));
    }
    case "SET_QTY": {
      const line = state.find((i) => i.id === action.id);
      if (!line) return state;
      const qty = Math.min(capFor(state, line.slug, line.id), action.qty);
      if (qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) => (i.id === action.id ? { ...i, qty } : i));
    }
    case "SYNC_STOCK":
      return applyStock(state, action.stock);
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
  /** Agrega hasta donde alcance el stock. Devuelve las unidades que
   * realmente entraron (0 si ya no queda nada disponible). */
  add: (item: Omit<CartItem, "id" | "qty">, qty?: number) => number;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Unidades de un producto en el carrito (todos sus colores). */
  qtyInCart: (slug: string) => number;
  /** true si la línea `id` puede subir una unidad más sin pasar el stock. */
  canIncrease: (id: string) => boolean;
  /** Ajusta el carrito al stock real (p. ej. tras validarlo el servidor). */
  syncStock: (stock: StockMap) => void;
  /** Vuelve a consultar el stock al servidor (p. ej. al entrar al checkout). */
  refreshStock: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Consulta el stock real de las líneas y recorta el carrito. */
function refreshFrom(lines: CartItem[], dispatch: (a: Action) => void) {
  if (lines.length === 0) return;
  getCartStock(
    lines.map((i) => i.slug),
    readPendingCheckout(),
  )
    .then((stock) => dispatch({ type: "SYNC_STOCK", stock }))
    .catch(() => {
      // sin red: el checkout vuelve a validar en el servidor
    });
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Empezamos vacío en SSR y en el primer render de cliente (evita mismatch
  // de hidratación); cargamos de localStorage tras montar.
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.v === STORAGE_VERSION && Array.isArray(parsed.items)) {
          stored = parsed.items;
          dispatch({ type: "HYDRATE", items: stored });
        }
      }
    } catch {
      // storage corrupto o no disponible: ignorar
    }
    setHydrated(true);

    // El carrito guardado puede tener cantidades que ya no hay (alguien más
    // compró, el admin bajó el stock...): se recorta contra la DB.
    if (stored.length > 0) refreshFrom(stored, dispatch);
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
      add: (item, qty = 1) => {
        const id = lineId(item.slug, item.colorNombre);
        const action: Action = { type: "ADD", item: { ...item, id, qty } };
        // Mismo reducer para que lo devuelto coincida con el estado final.
        const before = items.find((i) => i.id === id)?.qty ?? 0;
        const after =
          reducer(items, action).find((i) => i.id === id)?.qty ?? 0;
        dispatch(action);
        return Math.max(0, after - before);
      },
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      clear: () => dispatch({ type: "CLEAR" }),
      qtyInCart: (slug) => qtyOf(items, slug),
      canIncrease: (id) => {
        const line = items.find((i) => i.id === id);
        return !!line && capFor(items, line.slug, id) > line.qty;
      },
      syncStock: (stock) => dispatch({ type: "SYNC_STOCK", stock }),
      refreshStock: () => refreshFrom(items, dispatch),
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
