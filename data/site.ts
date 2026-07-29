/** Configuración global del sitio (mock de Fase 1). */

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nuevos", label: "Nuevos" },
  { href: "/nosotras", label: "Sobre TOPWIGS" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const SOCIALS = {
  instagram: { handle: "@topwigs__", href: "https://instagram.com" },
  tiktok: { handle: "@topwigs__", href: "https://tiktok.com" },
  whatsapp: { numero: "+57 300 000 0000", href: "https://wa.me/573000000000" },
  email: { direccion: "hola@topwigs.co", href: "mailto:hola@topwigs.co" },
} as const;

export const TAGLINE = "No eres otra persona, eres otra versión de ti.";
