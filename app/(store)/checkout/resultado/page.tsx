import type { Metadata } from "next";
import Link from "next/link";
import { Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeartDrip } from "@/components/icons";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { fetchWompiTransaction, applyWompiTransaction } from "@/lib/wompi";

export const metadata: Metadata = {
  title: "Resultado de tu compra",
};

/**
 * Página de retorno de Wompi. Wompi redirige aquí con `?id=<transacción>`,
 * pero ese redirect no es confiable por sí solo (el navegador puede
 * cerrarse antes de llegar, o el estado cambiar después). Por eso
 * consultamos el estado real de la transacción en la API de Wompi y lo
 * aplicamos al pedido (mismo camino idempotente que usa el webhook, que
 * sigue siendo la fuente de verdad definitiva si esta consulta falla).
 */
export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let status: string | null = null;
  if (id) {
    const tx = await fetchWompiTransaction(id);
    if (tx) {
      const applied = await applyWompiTransaction(tx);
      status = applied.ok ? applied.status : null;
    }
  }

  if (status === "APPROVED") {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <ClearCartOnMount />
        <HeartDrip className="size-16 text-neon text-glow" />
        <h1 className="font-heading text-3xl font-extrabold uppercase text-glow">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-humo">
          Tu pago fue aprobado. Te enviaremos la confirmación por correo.
        </p>
        <p className="font-pixel text-[10px] uppercase tracking-widest text-humo/70">
          Transacción: {id}
        </p>
        <Link href="/pelucas">
          <Button>Seguir comprando</Button>
        </Link>
      </main>
    );
  }

  if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <XCircle className="size-16 text-red-500" />
        <h1 className="font-heading text-3xl font-extrabold uppercase text-glow">
          Tu pago no fue aprobado
        </h1>
        <p className="text-humo">
          No pudimos procesar el pago. Tu carrito sigue intacto, puedes
          intentarlo de nuevo.
        </p>
        <p className="font-pixel text-[10px] uppercase tracking-widest text-humo/70">
          Transacción: {id}
        </p>
        <Link href="/checkout">
          <Button>Volver al checkout</Button>
        </Link>
      </main>
    );
  }

  // PENDING, o no pudimos confirmar el estado todavía (p. ej. la API de
  // Wompi no respondió). El webhook lo terminará de confirmar.
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <Clock className="size-16 text-neon text-glow" />
      <h1 className="font-heading text-3xl font-extrabold uppercase text-glow">
        Estamos confirmando tu pago
      </h1>
      <p className="text-humo">
        Este proceso puede tardar unos minutos. Te avisaremos por correo
        apenas se confirme.
      </p>
      {id ? (
        <p className="font-pixel text-[10px] uppercase tracking-widest text-humo/70">
          Transacción: {id}
        </p>
      ) : null}
      <Link href="/pelucas">
        <Button variant="outline">Seguir comprando</Button>
      </Link>
    </main>
  );
}
