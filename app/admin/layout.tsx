import { requireAdmin } from "@/lib/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/** Layout del panel admin: exige rol admin y monta la barra lateral. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-noir">
      <AdminSidebar userName={session.user.name} />
      <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
