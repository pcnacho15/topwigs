import { Navbar } from "@/components/layout/navbar";
// import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getNavLinks } from "@/lib/queries/catalog";

/** Layout de la tienda pública: navbar, footer y drawer del carrito. */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = await getNavLinks();

  return (
    <>
      <Navbar links={navLinks} />
      {children}
      <CartDrawer />
    </>
  );
}
