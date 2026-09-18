"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { Search, Cart } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { useCart } from "@/components/cart/cart-context";
import type { NavLink } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Barra de navegación global: sticky, con links + iconos de acción y
 * menú desplegable en móvil. Los links llegan por props desde el layout
 * (servidor), porque dependen de los catálogos en base de datos.
 * Marca el link activo según la ruta.
 * Micro-animaciones: entrada suave, feedback al tocar iconos y
 * apertura/cierre animado del menú móvil.
 */
export function Navbar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { totalItems, open: openCart } = useCart();

  // Cierra el menú al cambiar de ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <m.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-neon/30 bg-noir/85 backdrop-blur-md"
    >
      <AnnouncementBar />

      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        {/* Hamburguesa (móvil) */}
        <m.button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          className="ml-1 flex flex-col gap-1.5 md:hidden"
        >
          <span
            className={cn(
              "h-0.5 w-6 bg-neon transition-transform",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cn(
              "h-0.5 w-6 bg-neon transition-opacity",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "h-0.5 w-6 bg-neon transition-transform",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </m.button>

        <Link
          href="/"
          aria-label="TOPWIGS — inicio"
          className="shrink-0"
        >
          <Logo size="lg" />
        </Link>

        {/* Links (desktop) */}
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "font-heading text-sm font-semibold uppercase tracking-wide transition-colors",
                  isActive(link.href)
                    ? "text-neon text-glow"
                    : "text-humo hover:text-blanco",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones */}
        <div className="flex items-center gap-4 text-blanco">
          {/* <m.button
            aria-label="Buscar"
            className="hover:text-neon"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.85 }}
          >
            <Search className="size-7 cursor-pointer" />
          </m.button> */}
          <ThemeToggle />
          <m.button
            aria-label={`Carrito (${totalItems})`}
            onClick={openCart}
            className="relative hover:text-neon"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.85 }}
          >
            <Cart className="size-7 cursor-pointer" />
            {totalItems > 0 ? (
              <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-neon text-[9px] font-bold text-ink">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            ) : null}
          </m.button>
          <UserMenu />
        </div>
      </nav>

      {/* Menú móvil (animado) */}
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            {/* El padding y el borde van aquí dentro: en el elemento animado
                seguirían ocupando alto con height: 0 y el menú daría un
                salto justo antes de desaparecer. */}
            <ul className="flex flex-col gap-1 border-t border-neon/20 bg-surface-1 px-4 py-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-goth px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide",
                      isActive(link.href)
                        ? "bg-neon/10 text-neon"
                        : "text-humo hover:bg-linea/40 hover:text-blanco",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.header>
  );
}
