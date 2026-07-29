import type { Wig } from "@/lib/types";

const FEATURES_BASE = [
  "No necesita pegamento",
  "Con malla frontal amplia",
  "Resistente al calor",
];

const DESC_BASE =
  "Peluca de fibra seminatural, resistente al calor. Ideal para uso diario o looks especiales.";

/** Catálogo semilla (de plantilla.jpeg). Precios en COP. */
export const WIGS: Wig[] = [
  {
    slug: "red-velvet",
    nombre: "Red Velvet",
    precio: 160000,
    categoria: "cosplay",
    rating: 4,
    reviews: 24,
    colores: [
      { nombre: "Rojo vino", hex: "#7a1f2b" },
      { nombre: "Cereza", hex: "#a51d2d" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "aurora",
    nombre: "Aurora",
    precio: 160000,
    categoria: "rubias",
    rating: 5,
    reviews: 31,
    colores: [
      { nombre: "Rubio platino", hex: "#e8dcc0" },
      { nombre: "Rubio miel", hex: "#c9a25b" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "honey",
    nombre: "Honey",
    precio: 160000,
    categoria: "rubias",
    rating: 4,
    reviews: 18,
    colores: [
      { nombre: "Miel", hex: "#c98a3c" },
      { nombre: "Cobre", hex: "#b5641f" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "nebula",
    nombre: "Nebula",
    precio: 160000,
    categoria: "fantasia",
    rating: 5,
    reviews: 42,
    colores: [
      { nombre: "Magenta", hex: "#d13b8f" },
      { nombre: "Fucsia", hex: "#ff2f92" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
    nuevo: true,
  },
  {
    slug: "dakota",
    nombre: "Dakota",
    precio: 160000,
    categoria: "cosplay",
    rating: 4,
    reviews: 12,
    colores: [
      { nombre: "Castaño", hex: "#5a3a26" },
      { nombre: "Chocolate", hex: "#3d2418" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "abyss",
    nombre: "Abyss",
    precio: 160000,
    categoria: "negras",
    rating: 4,
    reviews: 27,
    colores: [
      { nombre: "Negro azabache", hex: "#0e0e12" },
      { nombre: "Verde oscuro", hex: "#1f3b2e" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "yasmin",
    nombre: "Yasmin",
    precio: 160000,
    categoria: "negras",
    rating: 5,
    reviews: 35,
    colores: [
      { nombre: "Negro", hex: "#111114" },
      { nombre: "Negro azul", hex: "#141824" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
  },
  {
    slug: "celeste",
    nombre: "Celeste",
    precio: 135000,
    categoria: "fantasia",
    rating: 4,
    reviews: 21,
    colores: [
      { nombre: "Azul cielo", hex: "#5aa9e6" },
      { nombre: "Aqua", hex: "#3fbfbf" },
    ],
    descripcion: DESC_BASE,
    features: FEATURES_BASE,
    nuevo: true,
  },
];

export function getWig(slug: string): Wig | undefined {
  return WIGS.find((w) => w.slug === slug);
}
