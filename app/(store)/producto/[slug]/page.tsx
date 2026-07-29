import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicProductBySlug,
  getPublicProducts,
} from "@/lib/queries/catalog";
import { ProductDetail } from "@/components/sections/product-detail";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ChevronRight } from "@/components/icons";

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

  const all = await getPublicProducts();
  const related = [
    ...all.filter(
      (p) =>
        p.categoria.slug === product.categoria.slug && p.slug !== product.slug,
    ),
    ...all.filter((p) => p.categoria.slug !== product.categoria.slug),
  ].slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12">
      <nav
        aria-label="Ruta de navegación"
        className="flex items-center gap-1.5 font-heading text-xs uppercase tracking-wide text-humo"
      >
        <Link href="/" className="transition-colors hover:text-neon">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/catalogo" className="transition-colors hover:text-neon">
          Catálogo
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neon">{product.nombre}</span>
      </nav>

      <Reveal>
        <ProductDetail product={product} />
      </Reveal>

      {related.length > 0 ? (
        <section className="space-y-8">
          <Reveal>
            <SectionHeading>También te puede gustar</SectionHeading>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <StaggerItem key={p.slug}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}
    </main>
  );
}
