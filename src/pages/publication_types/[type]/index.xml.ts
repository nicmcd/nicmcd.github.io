import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { site } from "../../../site.config.ts";
import { getPublicationsSorted } from "../../../utils/content.ts";
import { publicationFeedItems } from "../../../utils/feeds.ts";
import { publicationTypeLabel } from "../../../utils/tags.ts";

export const getStaticPaths = (async () => {
  const publications = await getPublicationsSorted();
  const types = [...new Set(publications.map((p) => p.data.type))];
  return types.map((type) => ({
    params: { type },
    props: { type },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async (context) => {
  const { type } = context.props as { type: string };
  const publications = await getPublicationsSorted();
  const ofType = publications.filter((p) => p.data.type === type);
  return rss({
    title: `${publicationTypeLabel(type)} | ${site.title}`,
    description: publicationTypeLabel(type),
    site: context.site ?? site.url,
    items: publicationFeedItems(ofType),
  });
};
