/** Configuración global del sitio. */

import { FREE_SHIPPING_LABEL } from "@/lib/shipping";

/**
 * Los links de navegación ya no viven aquí: se arman desde los tipos de
 * producto que el admin tenga activos (`getNavLinks` en
 * `lib/queries/catalog.ts`), para que un catálogo nuevo aparezca solo.
 */
export interface NavLink {
  href: string;
  label: string;
}

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
