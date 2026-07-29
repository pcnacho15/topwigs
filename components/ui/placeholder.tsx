import { HeartDrip } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Marcador de posición para imágenes (dolls / productos) mientras no
 * tengamos los assets reales. Degradado gótico + icono centrado.
 */
export function ImagePlaceholder({
  label,
  className,
  ratio = "aspect-[3/4]",
}: {
  label?: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={cn(
        ratio,
        "flex flex-col items-center justify-center gap-2 rounded-goth",
        "bg-[radial-gradient(120%_100%_at_50%_0%,rgba(186,43,226,0.25),rgba(255,47,146,0.12)_45%,#0a0a0d_85%)]",
        "border border-linea text-neon/50",
        className,
      )}
      aria-hidden
    >
      <HeartDrip className="size-8" />
      {label && (
        <span className="font-pixel text-[9px] uppercase text-humo/70">
          {label}
        </span>
      )}
    </div>
  );
}
