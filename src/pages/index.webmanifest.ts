import type { APIRoute } from "astro";
import { site } from "../site.config.ts";

export const GET: APIRoute = () => {
  const manifest = {
    name: site.title,
    short_name: site.title,
    lang: "en-us",
    theme_color: site.themeColors.primary,
    background_color: site.themeColors.primary,
    icons: [
      { src: "img/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "img/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    display: "standalone",
    start_url: "/?utm_source=web_app_manifest",
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};
