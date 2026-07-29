"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, Package, LogOut, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { User } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/shadcn/dropdown-menu";

/**
 * Ícono de usuario del navbar.
 * - Sin sesión → enlace a /login.
 * - Con sesión → dropdown (Perfil, Mis pedidos, [Admin], Cerrar sesión).
 */
export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending || !session) {
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        className="transition-colors hover:text-neon"
      >
        <User className="size-7 cursor-pointer" />
      </Link>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mi cuenta"
        className="outline-none transition-colors hover:text-neon focus-visible:text-neon"
      >
        <User className="size-7 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-heading text-sm font-semibold text-blanco">
            {session.user.name}
          </p>
          <p className="truncate text-xs text-humo">{session.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/cuenta">
            <UserIcon />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/cuenta/pedidos">
            <Package />
            Mis pedidos
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
