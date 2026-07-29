import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Sesión actual (o null) en Server Components / actions. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige sesión; si no hay, redirige a /login. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Exige rol admin; redirige a /login o / si no cumple. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.user.role !== "admin") redirect("/");
  return session;
}
