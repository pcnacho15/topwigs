import type { Metadata } from "next";
import Script from "next/script";
import { montserrat, raleway, pressStart } from "./fonts";
import { MotionProvider } from "@/components/motion/provider";
import { CartProvider } from "@/components/cart/cart-context";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

/** Fija la clase de tema en <html> antes de la hidratación (localStorage
 * "topwigs-theme") para que no haya flash del tema equivocado al cargar. */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("topwigs-theme");
    if (theme !== "light" && theme !== "dark") theme = "dark";
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: {
    default: "TOPWIGS · Pelucas - Lentes y más",
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
      suppressHydrationWarning
      className={`${montserrat.variable} ${raleway.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <MotionProvider>
            <CartProvider>{children}</CartProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
