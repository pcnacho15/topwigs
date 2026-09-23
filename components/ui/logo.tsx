import Image from "next/image";
import logo from "@/public/modelos/wordmarkxl.png";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "h-6",
  md: "h-10",
  lg: "h-14",
  xl: "h-20 sm:h-32",
};

/** Logo oficial de TOPWIGS (public/modelos/wordmarkxl.png). */
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
    <Image
      src={logo}
      alt="TOPWIGS"
      className={cn(
        "w-auto select-none",
        glow && "drop-shadow-[0_0_10px_rgba(255,47,146,0.55)]",
        sizes[size],
        className,
      )}
    />
  );
}
