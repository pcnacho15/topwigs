import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Ruta vieja del catálogo único. Los query params (?categoria=) se
  // conservan en el redirect. Por eso "catalogo" es un slug reservado para
  // los tipos de producto (ver `lib/schemas/product-type.ts`).
  redirects() {
    return [{ source: "/catalogo", destination: "/pelucas", permanent: true }];
  },
};

export default nextConfig;
