import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../../site.config.ts";
import { getPublicationsSorted } from "../../utils/content.ts";
import { publicationTypeLabel } from "../../utils/tags.ts";

export const GET: APIRoute = async (context) => {
  const publications = await getPublicationsSorted();
  const types = [...new Set(publications.map((p) => p.data.type))].sort();
  return rss({
    title: `Publication Types | ${site.title}`,
    description: "Publication Types",
    site: context.site ?? site.url,
    items: types.map((type) => ({
      title: publicationTypeLabel(type),
      link: `/publication_types/${type}/`,
      description: "",
    })),
  });
};
