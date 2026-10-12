import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heart } from "@/components/icons";
import { CategoryInfo } from "@/components/ui/category-info";
import type { PublicCategoriaFicha } from "@/lib/public-product";

/**
 * Tarjeta de categoría destacada (Home). Enlaza al catálogo filtrado y, si
 * la categoría tiene ficha, ofrece abrirla debajo del nombre.
 */
export function CategoryCard({
  categoria,
  image,
  catalogo,
  ficha,
}: {
  categoria: { slug: string; nombre: string };
  image?: string;
  /** Ruta del catálogo al que pertenece la categoría (p. ej. `/pelucas`). */
  catalogo: string;
  ficha?: PublicCategoriaFicha;
}) {
  return (
    <div className="flex flex-col">
      <Link
        href={`${catalogo}?categoria=${categoria.slug}`}
        className="group block"
      >
        <Card className="overflow-hidden">
          <div className="relative aspect-3/4 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(186,43,226,0.28),rgba(255,47,146,0.12)_45%,var(--color-surface-3)_82%)]">
            {image ? (
              <Image
                src={image}
                alt={`Categoría ${categoria.nombre}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover drop-shadow-[0_0_18px_rgba(255,47,146,0.35)] transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
        </Card>
        <div className="flex items-center justify-center gap-2 py-2">
          <h3 className="text-sm font-semibold capitalize tracking-wide">
            {categoria.nombre}
          </h3>
          {/* <Heart className="size-4 text-neon" /> */}
        </div>
      </Link>
      {/* Fuera del Link: los clics dentro del modal no deben navegar. */}
      {ficha ? (
        <CategoryInfo
          ficha={ficha}
          label="Características"
          className="self-center"
        />
      ) : null}
    </div>
  );
}
