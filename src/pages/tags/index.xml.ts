import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../../site.config.ts";
import { getProjectsSorted, getPublicationsSorted, aggregateTags } from "../../utils/content.ts";

export const GET: APIRoute = async (context) => {
  const [projects, publications] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
  ]);
  const tags = aggregateTags(projects, publications);
  return rss({
    title: `Tags | ${site.title}`,
    description: "Tags",
    site: context.site ?? site.url,
    items: tags.map((tag) => ({
      title: tag.name,
      link: `/tags/${tag.slug}/`,
      description: "",
    })),
  });
};
