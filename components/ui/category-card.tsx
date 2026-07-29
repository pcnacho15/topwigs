import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heart } from "@/components/icons";

/** Tarjeta de categoría destacada (Home). Enlaza al catálogo filtrado. */
export function CategoryCard({
  categoria,
  image,
}: {
  categoria: { slug: string; nombre: string };
  image?: string;
}) {
  return (
    <Link href={`/catalogo?categoria=${categoria.slug}`} className="group block">
      <Card className="overflow-hidden">
        <div className="relative aspect-[3/4] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(186,43,226,0.28),rgba(255,47,146,0.12)_45%,#0a0a0d_82%)]">
          {image ? (
            <Image
              src={image}
              alt={`Categoría ${categoria.nombre}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain object-bottom drop-shadow-[0_0_18px_rgba(255,47,146,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-2 p-3">
          <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
            {categoria.nombre}
          </h3>
          <Heart className="size-4 text-neon" />
        </div>
      </Card>
    </Link>
  );
}
