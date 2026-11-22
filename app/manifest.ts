import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Selah Sky", short_name: "Selah Sky",
    description: "A quiet place for Scripture, reflection, and prayer.",
    start_url: "/", display: "browser", background_color: "#000000", theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
