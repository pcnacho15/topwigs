import Image from "next/image";
import wordmark from "@/public/modelos/wordmark.png";
import { cn } from "@/lib/utils";

/**
 * Logo TOPWIGS con el arte graffiti real (extraído de hero.jpeg).
 * `height` controla el tamaño; el ancho se calcula por proporción.
 */
export function Wordmark({
  height = 34,
  priority = false,
  className,
}: {
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round((wordmark.width / wordmark.height) * height);
  return (
    <Image
      src={wordmark}
      alt="TOPWIGS"
      height={height}
      width={width}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      style={{ height }}
    />
  );
}
