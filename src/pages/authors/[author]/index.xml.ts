import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { site } from "../../../site.config.ts";
import { getPublicationsSorted } from "../../../utils/content.ts";
import { publicationFeedItems } from "../../../utils/feeds.ts";

export const getStaticPaths = (async () => {
  const authors = await getCollection("authors");
  return authors.map((author) => ({
    params: { author: author.data.slug },
    props: { name: author.data.name, slug: author.data.slug },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async (context) => {
  const { name, slug } = context.props as { name: string; slug: string };
  const publications = await getPublicationsSorted();
  const authored = publications.filter((p) => p.data.authors.includes(slug));
  return rss({
    title: `${name} | ${site.title}`,
    description: name,
    site: context.site ?? site.url,
    items: publicationFeedItems(authored),
  });
};
