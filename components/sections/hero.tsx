"use client";

import Link from "next/link";
import Image from "next/image";
import { m, useReducedMotion, type Variants } from "motion/react";
import wordmarkLg from "@/public/modelos/wordmarkxl.png";
import { Star, Sparkle, Fire, Truck, Heart } from "@/components/icons";
import { Bunny } from "@/components/ui/bunny";
import { fadeUp } from "@/components/motion/variants";

/**
 * Hero por capas, interactivo + con entrada animada al montar.
 * Orquestación (stagger): estrellas hacen twinkle sutil; las dolls suben,
 * el wordmark hace scale-in (sin fade → LCP-safe) y tagline/CTA/barra
 * aparecen con fade-up. Respeta prefers-reduced-motion.
 */

const DOLLS = [
  // [src, alto intrínseco, clases de posición]
  {
    src: "/modelos/modelo3.png",
    w: 1080,
    h: 1227,
    cls: "z-50 left-20 w-[30vw] max-w-[450px] lg:block hidden",
  },
  {
    src: "/modelos/modelo2.png",
    w: 1080,
    h: 1227,
    cls: "z-40 left-[17.5vw] w-[30vw] max-w-[420px] lg:block hidden",
  },
  {
    src: "/modelos/modelo6.png",
    w: 1080,
    h: 1227,
    cls: "z-30 right-0 w-[35vw] max-w-[460px] lg:block hidden",
  },
  {
    src: "/modelos/modelo5.png",
    w: 1080,
    h: 1227,
    cls: "z-20 right-[13vw] w-[30vw] max-w-[420px] lg:block hidden",
  },
];

const BENEFICIOS = [
  { Icon: Sparkle, label: "Fibra seminatural" },
  { Icon: Fire, label: "Resistente al calor" },
  { Icon: Truck, label: "Envíos a toda Colombia" },
  { Icon: Heart, label: "Looks para diario y cosplay" },
];

// Contenedor que escalona la entrada de sus hijos (se reutiliza anidado).
const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
// Las dolls suben desde abajo hacia su posición.
const dollIn: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
// Wordmark: solo escala (sin opacidad) para no retrasar el LCP.
const wordmarkPop: Variants = {
  hidden: { scale: 0.94 },
  show: { scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const reduce = useReducedMotion();
  // Parpadeo sutil de estrellas (desactivado con reduce-motion).
  const twinkle = reduce
    ? undefined
    : { opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] };
  const twinkleT = { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <m.section
      className="relative isolate overflow-hidden bg-noir"
      variants={heroContainer}
      initial="hidden"
      animate="show"
    >
      {/* Estrellas decorativas con twinkle */}
      <m.div
        className="absolute left-[30%] top-10"
        animate={twinkle}
        transition={twinkleT}
      >
        <Star className="size-6 text-neon/70" />
      </m.div>
      <m.div
        className="absolute right-[32%] top-20"
        animate={twinkle}
        transition={{ ...twinkleT, delay: 0.8 }}
      >
        <Star className="size-4 text-neon/50" />
      </m.div>
      <m.div
        className="absolute left-[40%] bottom-40"
        animate={twinkle}
        transition={{ ...twinkleT, delay: 1.6 }}
      >
        <Sparkle className="size-5 text-violeta/70" />
      </m.div>
      <m.div
        className="absolute right-[38%] bottom-52"
        animate={twinkle}
        transition={{ ...twinkleT, delay: 2.2 }}
      >
        <Star className="size-5 text-neon/60" />
      </m.div>

      {/* Dolls flanqueando */}
      {DOLLS.map((d) => (
        <m.div
          key={d.src}
          variants={dollIn}
          className={`pointer-events-none absolute bottom-0 select-none ${d.cls}`}
        >
          <Image
            src={d.src}
            alt=""
            aria-hidden
            width={d.w}
            height={d.h}
            sizes="30vw"
            className="h-auto w-full drop-shadow-[0_0_30px_rgba(255,47,146,0.25)]"
          />
        </m.div>
      ))}

      {/* Contenido central (también escalona sus hijos) */}
      <m.div
        variants={heroContainer}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-12 pb-10 text-center lg:min-h-150 lg:justify-center lg:pt-16"
      >
        <h1 className="w-full max-w-140">
          <span className="sr-only">
            TOPWIGS — No es solo una peluca, es otra versión de ti.
          </span>
          <m.div
            variants={wordmarkPop}
            className="pointer-events-none flex justify-center items-center h-60"
          >
            <Image
              src={wordmarkLg}
              alt="TOPWIGS"
              priority
              width={80}
              height={120}
              sizes="(max-width: 0px) 90vw, 560px"
              className="mx-auto h-auto w-full drop-shadow-[0_0_28px_rgba(255,47,146,0.5)] z-30"
            />
          </m.div>
        </h1>

        <m.p
          variants={fadeUp}
          className="font-heading text-lg font-bold uppercase tracking-wide text-blanco sm:text-xl"
        >
          No es solo una peluca,
          <br />
          es otra{" "}
          <span className="relative inline-block text-neon text-glow">
            versión
            {/* Subrayado curvo dibujado a mano */}
            <svg
              className="absolute -bottom-1.5 left-0 h-2 w-full text-neon drop-shadow-[0_0_4px_rgba(255,47,146,0.6)]"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 6 C18 1.5, 38 1.5, 54 5 S86 9, 99 3.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          de ti.
        </m.p>

        {/* CTA interactivo (z alto para que quede por encima de dolls/wordmark) */}
        <m.div
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          className="relative z-60"
        >
          <Link
            href="/pelucas"
            className="cursor-pointer z-auto group relative inline-flex items-center gap-3 rounded-xl border border-neon bg-noir/60 px-4 font-heading text-sm font-bold uppercase tracking-widest text-blanco shadow-[0_0_22px_-4px_rgba(255,47,146,0.7)] transition-all hover:bg-neon/50 hover:text-noir hover:shadow-[0_0_30px_-2px_rgba(255,47,146,0.9)]"
          >
            Comprar ahora
            <Bunny height={60} />
          </Link>
        </m.div>
      </m.div>

      {/* Barra de beneficios */}
      <m.div
        variants={fadeUp}
        className="relative z-50 mx-auto mb-6 max-w-4xl px-4"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-full border border-transparent sm:border-neon/50 bg-none sm:bg-noir/70 px-6 py-3 backdrop-blur-sm">
          {BENEFICIOS.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-humo sm:text-xs"
            >
              <Icon className="size-4 shrink-0 text-neon" />
              {label}
            </li>
          ))}
        </ul>
      </m.div>

      {/* Barcode + firma (esquina inferior izquierda) */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden lg:block">
        <div
          className="h-8 w-32"
          style={{
            background:
              "repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 4px,#fff 4px 5px,transparent 5px 9px,#fff 9px 12px,transparent 12px 14px)",
          }}
          aria-hidden
        />
        <span className="mt-1 block font-pixel text-[9px] uppercase tracking-widest text-humo">
          TOPWIGS 24/7
        </span>
      </div>

      {/* Conejo doodle (esquina inferior derecha) */}
      <Bunny
        height={68}
        className="pointer-events-none absolute bottom-6 right-6 z-10 hidden lg:block"
      />
    </m.section>
  );
}
