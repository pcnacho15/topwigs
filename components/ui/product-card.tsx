"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicProduct } from "@/lib/public-product";
import { descuentoPct } from "@/lib/public-product";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiscountRibbon } from "@/components/ui/discount-ribbon";
import { PriceTag, formatCOP } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { ImagePlaceholder } from "@/components/ui/placeholder";
import { Heart, ShoppingBag } from "@/components/icons";
import { useCart } from "@/components/cart/cart-context";

/** Tarjeta de producto (catálogo y destacados). */
export function ProductCard({ product }: { product: PublicProduct }) {
  const { add, open } = useCart();
  const desc = descuentoPct(product.precioCop, product.precioOfertaCop);
  const img = product.imagenes[0];
  const primerColor = product.colores[0];

  /** Agrega el primer color del producto (o "Único" si no tiene colores):
   * es un atajo desde la tarjeta, la elección fina de color se hace en la
   * ficha del producto. */
  const handleAddToCart = () => {
    add({
      slug: product.slug,
      nombre: product.nombre,
      precio: product.precioOfertaCop ?? product.precioCop,
      colorNombre: primerColor?.nombre ?? "Único",
      colorHex: primerColor?.from ?? "#ff2f92",
      imagen: primerColor?.imagenes[0] ?? img,
    });
    open();
  };

  return (
    <div className="flex flex-col">
      <Card className="group relative overflow-hidden">
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          {product.agotado ? (
            <Badge tone="agotado">Agotado</Badge>
          ) : product.nuevo ? (
            <Badge
              tone="violeta"
              className="text-white"
            >
              Nuevo
            </Badge>
          ) : null}
        </div>
        <button
          aria-label={`Guardar ${product.nombre} en favoritos`}
          className="absolute right-3 top-3 z-10 text-humo transition-colors hover:text-neon"
        >
          <Heart className="size-5" />
        </button>

        <Link
          href={`/producto/${product.slug}`}
          className="block"
        >
          {img ? (
            <div className="relative aspect-4/5 overflow-hidden">
              <Image
                src={img}
                alt={product.nombre}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-300 group-hover:scale-105",
                  product.agotado && "grayscale opacity-60",
                )}
              />
              {!product.agotado && desc ? (
                <DiscountRibbon
                  pct={desc}
                  corner="top-left"
                  size="md"
                />
              ) : null}
            </div>
          ) : (
            <ImagePlaceholder
              label={product.nombre}
              ratio="aspect-[4/5]"
            />
          )}
        </Link>

        {!product.agotado ? (
          <>
            {/* Móvil: solo el ícono, siempre visible en la esquina. */}
            <button
              onClick={handleAddToCart}
              aria-label={`Agregar ${product.nombre} al carrito`}
              className="absolute bottom-1 right-2 z-10 flex size-9 items-center justify-center rounded-full bg-linear-to-br from-neon to-violeta shadow-[0_0_20px_-4px_rgba(255,47,146,0.7)] md:hidden"
            >
              <ShoppingBag className="size-5 text-slate-100" />
            </button>
            {/* Desktop: botón con texto, oculto hasta hacer hover en la card. */}
            <button
              onClick={handleAddToCart}
              aria-label={`Agregar ${product.nombre} al carrito`}
              className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-[150%] cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-br from-neon to-violeta py-3 text-xs font-bold uppercase text-gray-200 hover:text-white tracking-wide opacity-0 shadow-[0_0_20px_-4px_rgba(255,47,146,0.7)] transition-all duration-300 ease-out md:flex md:group-hover:translate-y-0 md:group-hover:opacity-100"
            >
              {/* <ShoppingBag className="size-4" /> */}
              Añadir al carrito
            </button>
          </>
        ) : null}
      </Card>
      <div className="flex items-center justify-between gap-2 py-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">
            {product.nombre}
          </h3>
          {/* {
              product.reviews > 0 && (
                <RatingStars value={product.rating} reviews={product.reviews} />
              )
            } */}
          {product.precioOfertaCop ? (
            <div className="flex items-baseline gap-2">
              <PriceTag
                value={product.precioOfertaCop}
                className="text-base text-neon"
              />
              <span className="text-base text-humo line-through">
                {formatCOP(product.precioCop)}
              </span>
            </div>
          ) : (
            <PriceTag
              value={product.precioCop}
              className="text-base"
            />
          )}
        </div>
      </div>
    </div>
  );
}
