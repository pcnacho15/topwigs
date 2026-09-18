import type { SVGProps } from "react";

/**
 * Set de iconos de marca TOPWIGS (trazo, estilo doodle gótico/Y2K).
 * Todos heredan el color vía `currentColor` y aceptan props de <svg>.
 * Uso: <Star className="size-4 text-neon" />
 */

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
};

/** Para los iconos macizos (sin trazo), que pintan con `fill`. */
const baseFill: IconProps = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
};

/* --- Decorativos --- */

export function Star(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l2 5.5L20 9l-4.5 3.5L17 18l-5-3-5 3 1.5-5.5L4 9l6-.5L12 3z" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c.4 4 1.5 5.1 5.5 5.5C13.5 8.9 12.4 10 12 14c-.4-4-1.5-5.1-5.5-5.5C10.5 8.1 11.6 7 12 3z" />
    </svg>
  );
}

export function Heart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.3-9-9c-1.2-2.9.6-6 3.6-6 2 0 3.4 1.4 4.4 3 1-1.6 2.4-3 4.4-3 3 0 4.8 3.1 3.6 6-2 4.7-9 9-9 9z" />
    </svg>
  );
}

/** Corazón con goteo (motivo emo de la plantilla) */
export function HeartDrip(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 17s-6-3.7-7.7-7.7C3.3 6.9 4.8 4.5 7.3 4.5c1.7 0 2.9 1.2 3.7 2.6.8-1.4 2-2.6 3.7-2.6 2.5 0 4 2.4 3 4.8C20 13.3 12 17 12 17z" />
      <path d="M8.5 16v2.5M12 17.5V21M15.5 16v2" />
    </svg>
  );
}

/** Conejo (mascota/elemento gráfico de la plantilla) */
export function Bunny(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 11c-1-2-1.5-4.5-1-6.5.3-1 1.4-.8 1.8.2.6 1.6 1 3.5 1.2 5.3" />
      <path d="M15 11c1-2 1.5-4.5 1-6.5-.3-1-1.4-.8-1.8.2-.6 1.6-1 3.5-1.2 5.3" />
      <path d="M7 15a5 5 0 0 1 10 0v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2z" />
      <path d="M10.5 15h3M12 15v1.5" />
    </svg>
  );
}



/** Cadena (motivo gótico) */
export function Chain(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="9.5" width="7" height="5" rx="2.5" transform="rotate(-45 7 12)" />
      <rect x="13.5" y="9.5" width="7" height="5" rx="2.5" transform="rotate(-45 17 12)" />
      <path d="M10 14l4-4" />
    </svg>
  );
}

/* --- Acciones / navegación --- */

/**
 * Caja de envío. A diferencia del resto, es un icono de relleno: no usa
 * `base` (que es de trazo) sino sus propios atributos.
 */
export function Package(props: IconProps) {
  return (
    <svg {...baseFill} {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m12 1.635l8.24 4.745l-3.36 1.935l-8.245-4.74zM3.76 6.38l3.37-1.94l8.25 4.745l-3.38 1.95zM17 9.98v3.52h-1.5v-2.655l-2.75 1.59v9.5l8.25-4.75V7.67zm-5.75 2.455V19.5H5V18h4.5v-1.5H3V15h5v-1.5H1V12h2V7.67z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Cart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="17.5" cy="20" r="1.3" />
    </svg>
  );
}

export function User(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function ChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Minus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* --- Redes / contacto --- */

export function Instagram(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTok(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M14 4c.4 2.3 1.8 3.7 4 4" />
    </svg>
  );
}

export function WhatsApp(props: IconProps) {
  return (
    <svg {...baseFill} {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967s-.47-.148-.669.15c-.198.297-.767.966-.94 1.164c-.174.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.019-.458.13-.606c.134-.133.297-.347.446-.52s.198-.298.297-.497c.1-.198.05-.371-.025-.52c-.074-.149-.668-1.612-.916-2.207c-.241-.579-.486-.5-.668-.51c-.174-.008-.372-.01-.57-.01s-.52.074-.792.372c-.273.297-1.04 1.016-1.04 2.479c0 1.462 1.064 2.875 1.213 3.074s2.095 3.2 5.076 4.487c.71.306 1.263.489 1.694.625c.712.227 1.36.195 1.872.118c.57-.085 1.758-.719 2.006-1.413s.247-1.289.173-1.413s-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 0 1-5.032-1.378l-.36-.214l-3.742.982l.999-3.648l-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.002-5.45 4.436-9.884 9.889-9.884a9.8 9.8 0 0 1 6.988 2.899a9.82 9.82 0 0 1 2.892 6.992c-.002 5.45-4.436 9.885-9.884 9.885m8.412-18.297A11.82 11.82 0 0 0 11.992 0C5.438 0 .102 5.335.1 11.892a11.86 11.86 0 0 0 1.587 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.82 11.82 0 0 0-3.48-8.413"
      />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

/* --- Iconos de beneficios (sección "¿Por qué TOPWIGS?") --- */

export function Fire(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c.5-1 .3-2 0-2.5 2 1 3.5 3 3.5 5.5a4.5 4.5 0 1 1-9 0C7.5 8 12 7 12 3z" />
    </svg>
  );
}

export function Thermometer(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 13.5V6a2 2 0 1 1 4 0v7.5a4 4 0 1 1-4 0z" />
      <path d="M12 15.5v-6" />
    </svg>
  );
}

export function Truck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

/** Pin de ubicación (destino del envío) */
export function MapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

/* --- Toggle de tema --- */

export function Sun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
    </svg>
  );
}

export function Moon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function Mask(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6c4-1 12-1 16 0 0 5-1 9-4 11-1 .7-3 1-4 1s-3-.3-4-1C5 15 4 11 4 6z" />
      <path d="M8.5 10.5c.6-.6 1.6-.6 2.2 0M13.3 10.5c.6-.6 1.6-.6 2.2 0" />
    </svg>
  );
}
