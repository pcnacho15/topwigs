"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";

/** Limpia el carrito una vez al montar (tras volver del pago). */
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // Solo al montar: vaciamos el carrito al volver de la pasarela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
