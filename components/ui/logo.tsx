import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-6xl sm:text-8xl",
};

/**
 * Wordmark "TOPWIGS". Placeholder tipográfico (.wordmark = Montserrat
 * black italic + glow) hasta integrar la fuente graffiti real de la marca.
 */
export function Logo({
  size = "md",
  glow = true,
  className,
}: {
  size?: Size;
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "wordmark text-neon select-none",
        glow && "text-glow",
        sizes[size],
        className,
      )}
    >
      TOP<span className="text-blanco">WIGS</span>
    </span>
  );
}
