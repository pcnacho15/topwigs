import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartDrip } from "@/components/icons";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const metadata: Metadata = {
  title: "Gracias por tu compra",
};

/**
 * Página de retorno de Wompi. Wompi redirige aquí con `?id=<transacción>`.
 * Nota: para producción, la confirmación real del pago debe hacerse con
 * el webhook de eventos de Wompi (o consultando el estado con la llave
 * privada) antes de despachar el pedido.
 */
export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <ClearCartOnMount />
      <HeartDrip className="size-16 text-neon text-glow" />
      <h1 className="font-heading text-3xl font-extrabold uppercase text-glow">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-humo">
        Estamos confirmando tu pago. Te enviaremos la confirmación por correo.
      </p>
      {id ? (
        <p className="font-pixel text-[10px] uppercase tracking-widest text-humo/70">
          Transacción: {id}
        </p>
      ) : null}
      <Link href="/pelucas">
        <Button>Seguir comprando</Button>
      </Link>
    </main>
  );
}
