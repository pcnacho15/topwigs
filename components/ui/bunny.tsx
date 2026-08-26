import Image from "next/image";
import bunny from "@/public/bunny.svg";
import { cn } from "@/lib/utils";

/**
 * Conejo doodle de marca. `height` controla el tamaño; el ancho se calcula
 * por proporción (el dibujo no es cuadrado: 1080×1227).
 *
 * Va como <Image> y no como SVG inline a propósito: el archivo pesa ~410 KB
 * porque lleva la ilustración incrustada en base64, no trazos vectoriales.
 * Inline entraría en el bundle y se repetiría en el HTML por cada instancia;
 * así se sirve como estático, se descarga una sola vez y queda cacheado.
 *
 * Es decorativo por defecto (`alt=""`). Pásale `alt` solo si en ese punto
 * el conejo aporta información que el texto de alrededor no da.
 */
export function Bunny({
  height = 68,
  alt = "",
  priority = false,
  className,
}: {
  height?: number;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round((bunny.width / bunny.height) * height);
  return (
    <Image
      src={bunny}
      alt={alt}
      height={height}
      width={width}
      priority={priority}
      className={cn("select-none", className)}
      style={{ height }}
    />
  );
}
