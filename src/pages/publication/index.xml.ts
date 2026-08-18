import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../../site.config.ts";
import { getPublicationsSorted } from "../../utils/content.ts";
import { publicationFeedItems } from "../../utils/feeds.ts";

export const GET: APIRoute = async (context) => {
  const publications = await getPublicationsSorted();
  return rss({
    title: `Publications | ${site.title}`,
    description: "Publications",
    site: context.site ?? site.url,
    items: publicationFeedItems(publications),
  });
};
