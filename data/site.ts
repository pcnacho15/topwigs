/** Configuración global del sitio (mock de Fase 1). */

import { CATALOGOS } from "@/data/catalogos";
import { FREE_SHIPPING_LABEL } from "@/lib/shipping";

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: CATALOGOS.peluca.href, label: CATALOGOS.peluca.label },
  { href: CATALOGOS.lente.href, label: CATALOGOS.lente.label },
  // { href: "/nuevos", label: "Nuevos" },
  // { href: "/nosotras", label: "Sobre TOPWIGS" },
  // { href: "/contacto", label: "Contacto" },
] as const;

export const SOCIALS = {
  instagram: {
    handle: "@topwigs__",
    href: "https://www.instagram.com/topwigs__",
  },
  tiktok: { handle: "@topwigs__", href: "https://www.tiktok.com/@topwigs__" },
  whatsapp: {
    numero: "+57 300 552 2419",
    href: "https://api.whatsapp.com/send?phone=573005522419",
  },
  // email: { direccion: "hola@topwigs.co", href: "mailto:hola@topwigs.co" },
} as const;

export const TAGLINE = "No eres otra persona, eres otra versión de ti.";

/** Mensaje de la cinta superior del header. Se arma con el umbral real de
 * `lib/shipping.ts` para que el anuncio no pueda contradecir lo que cobra
 * el checkout. */
export const ANNOUNCEMENT = `ENVÍO GRATIS POR COMPRAS SUPERIORES A $${FREE_SHIPPING_LABEL}`;
