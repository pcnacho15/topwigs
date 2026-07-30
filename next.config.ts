import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // El catálogo único se dividió en /pelucas y /lentes. Los query params
  // (?categoria=) se conservan en el redirect.
  redirects() {
    return [{ source: "/catalogo", destination: "/pelucas", permanent: true }];
  },
};

export default nextConfig;
