import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { site } from "../../site.config.ts";

export const GET: APIRoute = async (context) => {
  const authors = (await getCollection("authors")).sort((a, b) =>
    a.data.name.localeCompare(b.data.name),
  );
  return rss({
    title: `Authors | ${site.title}`,
    description: "Authors",
    site: context.site ?? site.url,
    items: authors.map((author) => ({
      title: author.data.name,
      link: `/authors/${author.data.slug}/`,
      description: author.data.bio ?? "",
    })),
  });
};
