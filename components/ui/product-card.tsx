import Link from "next/link";
import Image from "next/image";
import type { PublicProduct } from "@/lib/public-product";
import { descuentoPct } from "@/lib/public-product";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceTag, formatCOP } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { ImagePlaceholder } from "@/components/ui/placeholder";
import { Heart } from "@/components/icons";

/** Tarjeta de producto (catálogo y destacados). */
export function ProductCard({ product }: { product: PublicProduct }) {
  const desc = descuentoPct(product.precioCop, product.precioOfertaCop);
  const img = product.imagenes[0];

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
        {product.nuevo ? <Badge>Nuevo</Badge> : null}
        {desc ? <Badge tone="violeta">-{desc}%</Badge> : null}
      </div>
      <button
        aria-label={`Guardar ${product.nombre} en favoritos`}
        className="absolute right-3 top-3 z-10 text-humo transition-colors hover:text-neon"
      >
        <Heart className="size-5" />
      </button>

      <Link href={`/producto/${product.slug}`} className="block">
        {img ? (
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={img}
              alt={product.nombre}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <ImagePlaceholder label={product.nombre} ratio="aspect-[4/5]" />
        )}
        <div className="space-y-1.5 p-4">
          <h3 className="font-heading font-bold uppercase tracking-wide">
            {product.nombre}
          </h3>
          <RatingStars value={product.rating} reviews={product.reviews} />
          {product.precioOfertaCop ? (
            <div className="flex items-baseline gap-2">
              <PriceTag
                value={product.precioOfertaCop}
                className="text-lg text-neon"
              />
              <span className="text-sm text-humo line-through">
                {formatCOP(product.precioCop)}
              </span>
            </div>
          ) : (
            <PriceTag value={product.precioCop} className="text-lg" />
          )}
        </div>
      </Link>
    </Card>
  );
}
