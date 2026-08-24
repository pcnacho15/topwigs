"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatCOP } from "@/components/ui/price";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel, Textarea } from "@/components/ui/input";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeartDrip } from "@/components/icons";
import { createWompiCheckout } from "./actions";

export default function CheckoutPage() {
  const { items, subtotal, hydrated } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita el parpadeo "vacío" mientras se carga el carrito de localStorage.
  if (!hydrated) {
    return <main className="min-h-[50vh]" />;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <HeartDrip className="size-12 text-neon/40" />
        <p className="font-heading text-lg uppercase tracking-wide text-humo">
          Tu carrito está vacío
        </p>
        <Link href="/pelucas">
          <Button variant="outline">Ir al catálogo</Button>
        </Link>
      </main>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const customer = {
      nombre: String(form.get("nombre") ?? ""),
      email: String(form.get("email") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      direccion: String(form.get("direccion") ?? ""),
      departamento: String(form.get("departamento") ?? ""),
      municipio: String(form.get("municipio") ?? ""),
      barrio: String(form.get("barrio") ?? ""),
      indicaciones: String(form.get("indicaciones") ?? ""),
    };

    const res = await createWompiCheckout({
      items: items.map((i) => ({
        slug: i.slug,
        qty: i.qty,
        colorNombre: i.colorNombre,
      })),
      customer,
    });

    if (res.ok) {
      // Redirige a la pasarela de Wompi.
      window.location.href = res.url;
      return;
    }

    setLoading(false);
    setError(
      res.error === "missing_keys"
        ? "El pago aún no está configurado. Faltan las llaves de Wompi (WOMPI_PUBLIC_KEY / WOMPI_INTEGRITY_SECRET) en el servidor."
        : "No pudimos iniciar el pago. Revisa tu carrito e intenta de nuevo.",
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex justify-center">
        <SectionHeading>Checkout</SectionHeading>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Datos + pago */}
        <form onSubmit={onSubmit} className="space-y-5">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
            Tus datos
          </h2>
          <div>
            <FieldLabel htmlFor="nombre">Nombre completo</FieldLabel>
            <Input id="nombre" name="nombre" required placeholder="Tu nombre" />
          </div>
          <div>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <div>
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              required
              placeholder="+57 300 000 0000"
            />
          </div>

          <h2 className="pt-2 font-heading text-lg font-bold uppercase tracking-wide">
            Dirección de envío
          </h2>
          <div>
            <FieldLabel htmlFor="direccion">Dirección exacta</FieldLabel>
            <Input
              id="direccion"
              name="direccion"
              required
              placeholder="Calle 10 # 5-23, apto 301"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="departamento">Departamento</FieldLabel>
              <Input id="departamento" name="departamento" required placeholder="Antioquia" />
            </div>
            <div>
              <FieldLabel htmlFor="municipio">Municipio / Ciudad</FieldLabel>
              <Input id="municipio" name="municipio" required placeholder="Medellín" />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="barrio">Barrio</FieldLabel>
            <Input id="barrio" name="barrio" required placeholder="El Poblado" />
          </div>
          <div>
            <FieldLabel htmlFor="indicaciones">Indicaciones de entrega (opcional)</FieldLabel>
            <Textarea
              id="indicaciones"
              name="indicaciones"
              placeholder="Ej. casa color azul, portería principal, dejar con vecino si no hay nadie…"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Redirigiendo…" : `Pagar con Wompi · ${formatCOP(subtotal)}`}
          </Button>

          {error ? (
            <p role="alert" className="text-sm text-neon">
              {error}
            </p>
          ) : null}

          <p className="text-xs text-humo/70">
            Pago seguro procesado por Wompi. Serás redirigido para completar la
            transacción.
          </p>
        </form>

        {/* Resumen */}
        <RetroWindow title="resumen.exe">
          <div className="space-y-4 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
              Tu pedido
            </h2>
            <ul className="divide-y divide-linea">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span
                    className="size-12 shrink-0 rounded-goth border border-linea"
                    style={{
                      background: `radial-gradient(120% 100% at 50% 0%, ${item.colorHex}, #0a0a0d 82%)`,
                    }}
                    aria-hidden
                  />
                  <div className="flex-1">
                    <p className="font-heading text-sm font-bold uppercase tracking-wide">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-humo">
                      {item.colorNombre} · x{item.qty}
                    </p>
                  </div>
                  <span className="font-heading text-sm font-bold">
                    {formatCOP(item.precio * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-neon/30 pt-4">
              <span className="font-heading uppercase tracking-wide text-humo">
                Total
              </span>
              <span className="font-heading text-2xl font-bold text-glow">
                {formatCOP(subtotal)}
              </span>
            </div>
          </div>
        </RetroWindow>
      </div>
    </main>
  );
}
