"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "motion/react";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/components/ui/price";
import { Minus, Plus, HeartDrip } from "@/components/icons";

/** Drawer lateral del carrito. Se abre desde el ícono del navbar o al
 * agregar un producto. Sin backend: al pagar navega a /checkout. */
export function CartDrawer() {
  const { items, subtotal, isOpen, close, setQty, remove, totalItems } =
    useCart();

  // Bloquea el scroll del body mientras el drawer está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <m.div
          className="fixed inset-0 z-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Cerrar carrito"
            onClick={close}
            className="absolute inset-0 bg-noir/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <m.aside
            role="dialog"
            aria-label="Carrito de compras"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neon/40 bg-surface-1 shadow-[0_0_40px_-8px_rgba(255,47,146,0.4)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neon/30 px-5 py-4">
              <h2 className="font-heading text-lg font-extrabold uppercase text-glow">
                Tu carrito
                {totalItems > 0 ? (
                  <span className="ml-2 text-sm text-humo">({totalItems})</span>
                ) : null}
              </h2>
              <button
                aria-label="Cerrar"
                onClick={close}
                className="text-2xl leading-none text-humo transition-colors hover:text-neon"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            {items.length > 0 ? (
              <ul className="flex-1 divide-y divide-linea overflow-y-auto px-5">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    {item.imagen ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-goth border border-linea bg-surface-1">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      // Sin foto: se cae al swatch del color elegido.
                      <span
                        className="size-16 shrink-0 rounded-goth border border-linea"
                        style={{
                          background: `radial-gradient(120% 100% at 50% 0%, ${item.colorHex}, #0a0a0d 82%)`,
                        }}
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/producto/${item.slug}`}
                          onClick={close}
                          className="font-heading text-sm font-bold uppercase tracking-wide hover:text-neon"
                        >
                          {item.nombre}
                        </Link>
                        <button
                          aria-label={`Quitar ${item.nombre}`}
                          onClick={() => remove(item.id)}
                          className="text-xs text-humo transition-colors hover:text-neon"
                        >
                          Quitar
                        </button>
                      </div>
                      <p className="text-xs text-humo">{item.colorNombre}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-linea">
                          <button
                            aria-label="Disminuir"
                            onClick={() => setQty(item.id, item.qty - 1)}
                            className="grid size-8 place-items-center text-humo hover:text-neon"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.qty}
                          </span>
                          <button
                            aria-label="Aumentar"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            className="grid size-8 place-items-center text-humo hover:text-neon"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="font-heading font-bold">
                          {formatCOP(item.precio * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
                <HeartDrip className="size-12 text-neon/40" />
                <p className="font-heading uppercase tracking-wide text-humo">
                  Tu carrito está vacío
                </p>
                <Link href="/pelucas" onClick={close}>
                  <Button variant="outline" size="sm">
                    Ver pelucas
                  </Button>
                </Link>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 ? (
              <div className="space-y-4 border-t border-neon/30 px-5 py-5">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm uppercase tracking-wide text-humo">
                    Subtotal
                  </span>
                  <span className="font-heading text-xl font-bold text-glow">
                    {formatCOP(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-humo/70">
                  Los envíos e impuestos se calculan en el pago.
                </p>
                <Link href="/checkout" onClick={close} className="block">
                  <Button className="w-full">Ir a pagar</Button>
                </Link>
              </div>
            ) : null}
          </m.aside>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
