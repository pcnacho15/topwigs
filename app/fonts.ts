import { Montserrat, Raleway, Press_Start_2P } from "next/font/google";

/**
 * Tipografías de marca (self-hosted por next/font).
 * - Montserrat → títulos/headings
 * - Raleway    → cuerpo de texto
 * - Press Start 2P → acentos "pixel" (títulos de ventana, etiquetas retro)
 *
 * Nota: el wordmark graffiti "TOPWIGS" de la plantilla es una fuente
 * de display propia. Hasta tener el archivo real usamos la utilidad
 * `.wordmark` (Montserrat black italic) como placeholder.
 */
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});
