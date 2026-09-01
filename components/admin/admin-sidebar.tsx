"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Tags,
  Package,
  ShoppingBag,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/tipos", label: "Tipos de producto", Icon: Layers },
  { href: "/admin/categorias", label: "Categorías", Icon: Tags },
  { href: "/admin/productos", label: "Productos", Icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-linea bg-surface-1 p-4">
      <div className="mb-6 px-2">
        <span className="wordmark text-xl text-neon">
          TOP<span className="text-blanco">WIGS</span>
        </span>
        <p className="font-pixel text-[8px] uppercase tracking-widest text-humo">
          admin
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href, exact)
                ? "bg-neon/15 text-neon"
                : "text-humo hover:bg-white/5 hover:text-blanco",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-linea pt-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-humo transition-colors hover:text-blanco"
        >
          <ExternalLink className="size-4" />
          Ver tienda
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-humo transition-colors hover:text-neon"
        >
          <LogOut className="size-4" />
          Salir
        </button>
        <p className="truncate px-3 pt-2 text-xs text-humo/60">{userName}</p>
      </div>
    </aside>
  );
}
