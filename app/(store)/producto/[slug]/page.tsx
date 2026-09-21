import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicProductBySlug,
  getPublicProductsByTipo,
} from "@/lib/queries/catalog";
import { catalogoHref } from "@/lib/public-product";
import { ProductDetail } from "@/components/sections/product-detail";
import { ProductReviews } from "@/components/sections/product-reviews";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Reveal } from "@/components/motion/reveal";
import { ChevronRight } from "@/components/icons";
import { estimateDelivery } from "@/lib/delivery";

// Siempre fresco desde la DB (refleja cambios del admin al instante).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProductBySlug(slug);
  if (!p) return { title: "Producto no encontrado" };
  return { title: p.nombre, description: p.descripcion };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const catalogo = product.tipo;

  // Relacionados dentro del mismo catálogo (no mezclar tipos de producto).
  const all = await getPublicProductsByTipo(catalogo.slug);
  const related = [
    ...all.filter(
      (p) =>
        p.categoria.slug === product.categoria.slug && p.slug !== product.slug,
    ),
    ...all.filter((p) => p.categoria.slug !== product.categoria.slug),
  ].slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12">
      <nav
        aria-label="Ruta de navegación"
        className="flex items-center gap-1.5 font-heading text-xs uppercase tracking-wide text-humo"
      >
        <Link
          href="/"
          className="transition-colors hover:text-neon"
        >
          Inicio
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={catalogoHref(catalogo.slug)}
          className="transition-colors hover:text-neon"
        >
          {catalogo.label}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neon">{product.nombre}</span>
      </nav>

      <Reveal>
        {/* La estimación se calcula aquí (servidor) y baja como texto: la
            página es force-dynamic, así que se recalcula en cada visita. */}
        <ProductDetail
          product={product}
          envio={estimateDelivery()}
        />
      </Reveal>

      <Reveal>
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          rating={product.rating}
          reviewCount={product.reviews}
        />
      </Reveal>

      {related.length > 0 ? (
        <section className="space-y-8">
          <Reveal>
            <SectionHeading>También te puede gustar</SectionHeading>
          </Reveal>
          <Reveal>
            <Carousel>
              {related.map((p) => (
                <CarouselItem key={p.slug}>
                  <ProductCard product={p} />
                </CarouselItem>
              ))}
            </Carousel>
          </Reveal>
        </section>
      ) : null}
    </main>
  );
}
