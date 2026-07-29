import { Star, Sparkle } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Título de sección con doodles a los lados (estilo plantilla). */
export function SectionHeading({
  children,
  className,
  centered = true,
}: {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        centered && "justify-center text-center",
        className,
      )}
    >
      <Sparkle className="size-5 text-violeta" />
      <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow sm:text-3xl">
        {children}
      </h2>
      <Star className="size-5 text-neon" />
    </div>
  );
}
