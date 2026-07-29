import type { Metadata } from "next";
import { montserrat, raleway, pressStart } from "./fonts";
import { MotionProvider } from "@/components/motion/provider";
import { CartProvider } from "@/components/cart/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TOPWIGS · Pelucas góticas y de fantasía",
    template: "%s · TOPWIGS",
  },
  description:
    "No eres otra persona, eres otra versión de ti. Pelucas de fibra seminatural, resistentes al calor. Envíos a toda Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${raleway.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <CartProvider>{children}</CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
