import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Architect",
    short_name: "Architect",
    description: "Jim Rohn-inspired personal goal management application — attract success by the person you become.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#b45309",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
