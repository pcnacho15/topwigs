"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";
import { clearPendingCheckout } from "@/lib/pending-checkout";

/** Limpia el carrito una vez al montar (tras volver del pago). */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    // Debe esperar a que el carrito termine de hidratarse desde localStorage
    // (efecto del CartProvider); si limpiamos antes, la hidratación
    // sobreescribe el carrito vacío con el carrito guardado.
    if (!hydrated) return;
    clear();
    // El pago se aprobó: ese checkout ya no es una reserva "reutilizable".
    clearPendingCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  return null;
}
