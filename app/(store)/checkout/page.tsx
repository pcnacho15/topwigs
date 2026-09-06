"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatCOP } from "@/components/ui/price";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeartDrip } from "@/components/icons";
import {
  FREE_SHIPPING_THRESHOLD_COP,
  shippingCostFor,
} from "@/lib/shipping";
// import { ivaCopFor } from "@/lib/iva";
import { estimateDelivery } from "@/lib/delivery";
import {
  customerInfoSchema,
  EMPTY_CUSTOMER_INFO,
  type CustomerInfo,
} from "@/lib/schemas/customer-info";
import {
  clearLocalCustomerInfo,
  readLocalCustomerInfo,
  writeLocalCustomerInfo,
} from "@/lib/customer-info-storage";
import { ShippingSteps } from "@/components/ui/shipping-steps";
import { createWompiCheckout } from "./actions";
import {
  deleteSavedCustomerInfo,
  getCheckoutPrefill,
  saveCustomerInfo,
} from "./customer-actions";
import Image from "next/image";

/** De dónde salieron los datos con los que se precargó el formulario. */
type Origen = "cuenta" | "navegador" | null;

export default function CheckoutPage() {
  const { items, subtotal, hydrated } = useCart();
  // Mismo cálculo que usa el servidor al crear la orden.
  const shipping = shippingCostFor(subtotal);
  // const iva = ivaCopFor(subtotal + shipping);
  const total = subtotal + shipping /*+ iva*/;
  const faltaParaEnvioGratis = FREE_SHIPPING_THRESHOLD_COP - subtotal;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Se calcula una sola vez al montar. Puede hacerse en el cliente sin
  // riesgo de hidratación porque el guard de `hydrated` de más abajo impide
  // que esta pantalla se pinte en el servidor; y las fechas se fijan a la
  // zona horaria de Colombia, no a la del dispositivo.
  const [envio] = useState(estimateDelivery);

  // ── Datos guardados del cliente ──────────────────────────────────────
  // La copia local se lee en el primer render: en el servidor no hay
  // `localStorage` y sale `null`, pero ahí la página todavía pinta el
  // placeholder de `hydrated`, así que no hay desajuste de hidratación.
  const [local] = useState(readLocalCustomerInfo);
  // Los campos siguen siendo no controlados (`defaultValue`) para no
  // re-renderizar en cada tecla: al precargarlos se remonta el bloque con
  // `key` en vez de sincronizar estado campo por campo.
  const [datos, setDatos] = useState<CustomerInfo>(local ?? EMPTY_CUSTOMER_INFO);
  const [datosKey, setDatosKey] = useState(0);
  const [origen, setOrigen] = useState<Origen>(local ? "navegador" : null);
  const [recordar, setRecordar] = useState(local !== null);
  const [conCuenta, setConCuenta] = useState(false);
  // Si el comprador ya empezó a escribir, la copia de la cuenta (que llega
  // más tarde, por red) no le pisa lo que lleva escrito.
  const tocadoRef = useRef(false);

  function precargar(info: CustomerInfo, desde: Origen) {
    setDatos(info);
    setDatosKey((k) => k + 1);
    setOrigen(desde);
  }

  // La copia de la cuenta manda sobre la local porque viaja entre
  // dispositivos; y si no hay nada guardado, al menos se aprovechan el
  // nombre y el correo de la sesión.
  useEffect(() => {
    let vigente = true;
    getCheckoutPrefill()
      .then((prefill) => {
        if (!vigente) return;
        setConCuenta(prefill.conCuenta);
        if (tocadoRef.current) return;
        if (prefill.guardados) {
          precargar(prefill.guardados, "cuenta");
          setRecordar(true);
        } else if (prefill.sugerencia && !local) {
          precargar({ ...EMPTY_CUSTOMER_INFO, ...prefill.sugerencia }, null);
        }
      })
      .catch(() => {
        // sin sesión o sin red: se sigue con la copia local (o en blanco)
      });
    return () => {
      vigente = false;
    };
  }, [local]);

  async function olvidarDatos() {
    clearLocalCustomerInfo();
    setRecordar(false);
    tocadoRef.current = true; // a partir de aquí ya no se repuebla solo
    precargar(EMPTY_CUSTOMER_INFO, null);
    await deleteSavedCustomerInfo();
  }

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

    // Recordar (o dejar de recordar) nunca debe tumbar el pago: si algo
    // falla aquí, el checkout sigue igual.
    try {
      if (recordar) {
        const parsed = customerInfoSchema.safeParse(customer);
        if (parsed.success) {
          writeLocalCustomerInfo(parsed.data);
          await saveCustomerInfo(parsed.data);
        }
      } else {
        clearLocalCustomerInfo();
        await deleteSavedCustomerInfo();
      }
    } catch {
      // sin persistencia: no bloquea la compra
    }

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
        <form
          onSubmit={onSubmit}
          onInput={() => {
            tocadoRef.current = true;
          }}
          className="space-y-5"
        >
          {origen ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-goth border border-neon/40 bg-neon/5 px-4 py-3">
              <p className="text-xs text-humo">
                <span className="font-heading font-bold uppercase tracking-wide text-neon">
                  Datos precargados
                </span>{" "}
                ·{" "}
                {origen === "cuenta"
                  ? "guardados en tu cuenta"
                  : "guardados en este navegador"}
                . Puedes editarlos abajo.
              </p>
              <button
                type="button"
                onClick={olvidarDatos}
                className="cursor-pointer font-heading text-xs font-semibold uppercase tracking-wide text-humo underline underline-offset-4 transition-colors hover:text-neon"
              >
                Borrar datos guardados
              </button>
            </div>
          ) : null}

          {/* Se remonta al precargar para que los `defaultValue` tomen los
              datos guardados sin volver controlados los inputs. */}
          <div key={datosKey} className="space-y-5">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
              Tus datos
            </h2>
            <div>
              <FieldLabel htmlFor="nombre">Nombre completo</FieldLabel>
              <Input
                id="nombre"
                name="nombre"
                required
                autoComplete="name"
                defaultValue={datos.nombre}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={datos.email}
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
                autoComplete="tel"
                defaultValue={datos.telefono}
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
                autoComplete="street-address"
                defaultValue={datos.direccion}
                placeholder="Calle 10 # 5-23, apto 301"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="departamento">Departamento</FieldLabel>
                <Input
                  id="departamento"
                  name="departamento"
                  required
                  autoComplete="address-level1"
                  defaultValue={datos.departamento}
                  placeholder="Antioquia"
                />
              </div>
              <div>
                <FieldLabel htmlFor="municipio">Municipio / Ciudad</FieldLabel>
                <Input
                  id="municipio"
                  name="municipio"
                  required
                  autoComplete="address-level2"
                  defaultValue={datos.municipio}
                  placeholder="Medellín"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="barrio">Barrio</FieldLabel>
              <Input
                id="barrio"
                name="barrio"
                required
                autoComplete="address-level3"
                defaultValue={datos.barrio}
                placeholder="El Poblado"
              />
            </div>
            <div>
              <FieldLabel htmlFor="indicaciones">
                Indicaciones de entrega (opcional)
              </FieldLabel>
              <Textarea
                id="indicaciones"
                name="indicaciones"
                defaultValue={datos.indicaciones}
                placeholder="Ej. casa color azul, portería principal, dejar con vecino si no hay nadie…"
              />
            </div>
          </div>

          <Checkbox
            id="recordar"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
            label="Guardar mi información para la próxima vez"
            hint={
              conCuenta
                ? "Se guarda en tu cuenta y en este navegador: tu próxima compra llega con el formulario lleno."
                : "Se guarda solo en este navegador. Si creas una cuenta, la llevas a cualquier dispositivo."
            }
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Redirigiendo…"
              : `Pagar con Wompi · ${formatCOP(total)}`}
          </Button>

          {error ? (
            <p
              role="alert"
              className="text-sm text-neon"
            >
              {error}
            </p>
          ) : null}

          <p className="text-xs text-humo/70">
            Pago seguro procesado por Wompi. Serás redirigido para completar la
            transacción.
          </p>
        </form>

        {/* Resumen + tiempos de envío */}
        <div className="space-y-6">
          <RetroWindow title="resumen.exe">
            <div className="space-y-4 p-5 sm:p-6">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
                Tu pedido
              </h2>
              <ul className="divide-y divide-linea">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 py-3"
                  >
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
              <div className="space-y-2 border-t border-neon/30 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-humo">Subtotal</span>
                  <span className="text-blanco">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-humo">Envío</span>
                  {shipping === 0 ? (
                    <span className="font-heading font-bold uppercase text-neon">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-blanco">{formatCOP(shipping)}</span>
                  )}
                </div>
                {/* {faltaParaEnvioGratis > 0 ? (
                  <p className="text-xs text-humo/80">
                    Te faltan {formatCOP(faltaParaEnvioGratis)} para el envío
                    gratis.
                  </p>
                ) : null} */}
                {/* <div className="flex items-center justify-between text-sm">
                  <span className="text-humo">IVA</span>
                  <span className="text-blanco">{formatCOP(iva)}</span>
                </div> */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-heading uppercase tracking-wide text-humo">
                    Total
                  </span>
                  <span className="font-heading text-2xl font-bold text-glow">
                    {formatCOP(total)}
                  </span>
                </div>
              </div>
            </div>
          </RetroWindow>

          <ShippingSteps estimate={envio} />
        </div>
      </div>
    </main>
  );
}
