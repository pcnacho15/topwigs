import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/ui/category-card";
import { LensCategoryCard } from "@/components/ui/lens-category-card";
import { ProductCard } from "@/components/ui/product-card";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Hero } from "@/components/sections/hero";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import {
  Fire,
  Thermometer,
  Truck,
  Mask,
  Instagram,
  TikTok,
  WhatsApp,
} from "@/components/icons";
import { SOCIALS, TAGLINE } from "@/data/site";
import { catalogoHref } from "@/lib/public-product";
import {
  getCatalogo,
  getFeaturedCategories,
  getPublicCategoriesByTipo,
  getBestSellers,
} from "@/lib/queries/catalog";
import { getTestimonials } from "@/lib/queries/testimonials";
import { Footer } from "@/components/layout/footer";

const FEATURES = [
  {
    Icon: Fire,
    titulo: "Fibra seminatural",
    texto: "Apariencia real y suave al tacto.",
  },
  {
    Icon: Thermometer,
    titulo: "Resistente al calor",
    texto: "Puedes estilizarla con herramientas (baja temperatura).",
  },
  {
    Icon: Truck,
    titulo: "Envíos a toda Colombia",
    texto: "Recibe tu pedido en cualquier parte del país.",
  },
  {
    Icon: Mask,
    titulo: "Looks para diario y cosplay",
    texto: "Para cada versión de ti.",
  },
];

const SOCIAL_ROWS = [
  {
    id: "instagram",
    Icon: Instagram,
    texto: SOCIALS.instagram.handle,
    href: SOCIALS.instagram.href,
  },
  {
    id: "tiktok",
    Icon: TikTok,
    texto: SOCIALS.tiktok.handle,
    href: SOCIALS.tiktok.href,
  },
  {
    id: "whatsapp",
    Icon: WhatsApp,
    texto: SOCIALS.whatsapp.numero,
    href: SOCIALS.whatsapp.href,
  },
];

/** Catálogo cuyas categorías se muestran en la sección "Lentes de contacto". */
const TIPO_LENTES = "lentes";

export default async function Home() {
  // Solo las categorías que el admin marcó como destacadas, de cualquier
  // catálogo. Cada tarjeta enlaza al catálogo de su propio tipo.
  const [destacadas, lentes, categoriasLentes, masVendidos, testimonios] =
    await Promise.all([
      getFeaturedCategories(),
      getCatalogo(TIPO_LENTES),
      getPublicCategoriesByTipo(TIPO_LENTES),
      getBestSellers(),
      getTestimonials(),
    ]);

  return (
    <main className="flex flex-1 flex-col">
      {/* ============ HERO (HTML por capas, interactivo) ============ */}
      <Hero />

      <div className="flex flex-col items-center gap-20 px-4 py-16">
        {/* ============ LO MÁS VENDIDO ============ */}
        {/* No hay conteo de ventas real: se aproxima con productos que ya no
            son "nuevo" (ver getBestSellers), para que la sección tenga
            sentido de cara al cliente. */}
        {masVendidos.length > 0 ? (
          <Reveal className="w-full max-w-6xl">
            <RetroWindow title="bestseller.exe">
              <div className="space-y-8 p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge
                    tone="violeta"
                    className="text-white"
                  >
                    {/* <Fire className="size-3.5" /> */}
                    💘 Top ventas
                  </Badge>
                  <SectionHeading centered={false}>
                    Lo más vendido
                  </SectionHeading>
                </div>
                <Carousel>
                  {masVendidos.map((p) => (
                    <CarouselItem key={p.slug}>
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </Carousel>
                <div className="flex justify-center">
                  <Link href="/pelucas">
                    <Button
                      variant="outline"
                      className="rounded-full bg-neon hover:bg-neon/80 capitalize text-white"
                    >
                      Ver todo
                    </Button>
                  </Link>
                </div>
              </div>
            </RetroWindow>
          </Reveal>
        ) : null}

        {/* ============ ¿POR QUÉ TOPWIGS? ============ */}
        <section className="w-full max-w-6xl space-y-8">
          <Reveal>
            <SectionHeading>¿Por qué TOPWIGS?</SectionHeading>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, titulo, texto }) => (
              <StaggerItem
                key={titulo}
                className="flex flex-col items-center gap-3 text-center"
              >
                <span className="grid size-14 place-items-center rounded-full border border-neon/50 text-neon glow">
                  <Icon className="size-7" />
                </span>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-neon">
                  {titulo}
                </h3>
                <p className="max-w-60 text-sm text-humo">{texto}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ============ CATEGORÍAS DESTACADAS ============ */}
        {destacadas.length > 0 ? (
          <section className="w-full max-w-6xl space-y-8">
            <Reveal>
              <SectionHeading>Categorías destacadas</SectionHeading>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {destacadas.map((c) => (
                <StaggerItem key={c.slug}>
                  <CategoryCard
                    categoria={c}
                    image={c.imagen ?? undefined}
                    catalogo={catalogoHref(c.tipo.slug)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ) : null}

        {/* ============ TESTIMONIOS ============ */}
        <Testimonials testimonios={testimonios} />

        {/* ============ NUEVO: LENTES DE CONTACTO ============ */}
        {/* Solo las categorías (los colores), no los productos: la elección
            del lente en sí ocurre ya dentro del catálogo. */}
        {lentes && categoriasLentes.length > 0 ? (
          <section className="w-full max-w-6xl space-y-8">
            <Reveal>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge>Nuevo</Badge>
                <SectionHeading centered={false}>
                  Lentes de contacto
                </SectionHeading>
              </div>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {categoriasLentes.map((categoria) => (
                <StaggerItem key={categoria.slug}>
                  <LensCategoryCard
                    categoria={categoria}
                    catalogo={catalogoHref(lentes.slug)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
            <div className="flex justify-center">
              <Link href={catalogoHref(lentes.slug)}>
                <Button variant="outline">Ver todos</Button>
              </Link>
            </div>
          </section>
        ) : null}

        {/* ============ NOSOTRAS / SOBRE LA MARCA ============ */}
        <Reveal className="w-full max-w-6xl">
          <RetroWindow title="nosotras.exe">
            <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2 md:items-center">
              <div className="relative aspect-square">
                <Image
                  src="/modelos/modelos.png"
                  alt="Las modelos de TOPWIGS"
                  fill
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-contain drop-shadow-[0_0_28px_rgba(255,47,146,0.3)]"
                />
              </div>
              <div className="space-y-4">
                <SectionHeading centered={false}>Somos TOPWIGS</SectionHeading>
                <p className="text-humo">
                  Top Wigs nace para todas las personas que aman expresarse,
                  cambiar de look y sentirse increíbles sin miedo. <br /> Somos
                  una tienda especializada en pelucas, lentes de contacto y
                  accesorios de belleza, seleccionados para que puedas encontrar
                  ese look que tanto buscas y hacerlo parte de tu día a día.{" "}
                  <br /> Creemos que una peluca no tiene que ser solo para una
                  ocasión especial. Puedes usarla todos los días, experimentar
                  con diferentes estilos y ser quien quieras ser. En Top Wigs
                  nos enfocamos en ofrecer productos con estilo, variedad y
                  calidad, pero también en crear una experiencia de compra
                  cercana y confiable. <br /> <br />
                  <span className="flex items-center font-heading text-base font-extrabold uppercase tracking-wide text-glow">
                    Tu estilo. Tu esencia. Tu momento. <br /> Top Wigs — Brilla
                    sin miedo
                  </span>
                </p>

                <p className="font-pixel text-[10px] uppercase text-neon">
                  Thanks for being here!
                </p>
                {/* <Link href="/nosotras">
                  <Button variant="ghost">Leer más</Button>
                </Link> */}
              </div>
            </div>
          </RetroWindow>
        </Reveal>

        {/* ============ SÍGUENOS + CONTACTO ============ */}
        {/* <section className="grid w-full max-w-6xl gap-8 md:grid-cols-2">
          <Reveal className="space-y-6">
            <SectionHeading centered={false}>Síguenos</SectionHeading>
            <ul className="space-y-4">
              {SOCIAL_ROWS.map(({ id, Icon, texto, href }) => (
                <li key={id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-humo transition-colors hover:text-neon"
                  >
                    <span className="grid size-11 place-items-center rounded-full border border-neon/50 text-neon">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-lg">{texto}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <RetroWindow title="contacto.exe">
              <div className="space-y-5 p-6 sm:p-8">
                <div>
                  <h2 className="font-heading text-xl font-extrabold uppercase text-glow">
                    ¡Hablemos!
                  </h2>
                  <p className="mt-1 text-sm text-humo">
                    ¿Tienes dudas, sugerencias o quieres hacer un pedido
                    personalizado? Escríbenos.
                  </p>
                </div>
                <ContactForm />
              </div>
            </RetroWindow>
          </Reveal>
        </section> */}

        <Reveal>
          <p className="font-pixel text-[10px] uppercase text-humo/60">
            {TAGLINE}
          </p>
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}
