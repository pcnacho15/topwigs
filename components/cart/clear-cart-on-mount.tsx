"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";

/** Limpia el carrito una vez al montar (tras volver del pago). */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    // Debe esperar a que el carrito termine de hidratarse desde localStorage
    // (efecto del CartProvider); si limpiamos antes, la hidratación
    // sobreescribe el carrito vacío con el carrito guardado.
    if (!hydrated) return;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  return null;
}
