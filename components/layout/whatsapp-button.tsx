import { WhatsApp } from "@/components/icons";
import { SOCIALS } from "@/data/site";

const MENSAJE = "Hola, quiero hacer un pedido";

/**
 * Botón flotante fijo (esquina inferior derecha) para comprar por WhatsApp
 * directo, visible en toda la tienda. Colores de marca (neón + violeta),
 * igual que el resto de CTAs primarios del sitio.
 */
export function WhatsAppButton() {
  return (
    <a
      href={`${SOCIALS.whatsapp.href}&text=${encodeURIComponent(MENSAJE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-linear-to-br from-neon to-violeta text-blanco shadow-[0_0_20px_-4px_rgba(255,47,146,0.7)] transition-transform duration-200 hover:scale-110 hover:shadow-[0_0_28px_-2px_rgba(255,47,146,0.9)]"
    >
      <WhatsApp className="size-8 text-slate-100" />
    </a>
  );
}
