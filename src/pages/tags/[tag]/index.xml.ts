import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { site } from "../../../site.config.ts";
import {
  getProjectsSorted,
  getPublicationsSorted,
  aggregateTags,
} from "../../../utils/content.ts";
import { publicationFeedItems, projectFeedItems } from "../../../utils/feeds.ts";

export const getStaticPaths = (async () => {
  const [projects, publications] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
  ]);
  return aggregateTags(projects, publications).map((tag) => ({
    params: { tag: tag.slug },
    props: { tagName: tag.name },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async (context) => {
  const { tagName } = context.props as { tagName: string };
  const [projects, publications] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
  ]);
  const taggedPubs = publications.filter((p) => p.data.tags.includes(tagName));
  const taggedProjects = projects.filter((p) => p.data.tags.includes(tagName));
  return rss({
    title: `${tagName} | ${site.title}`,
    description: tagName,
    site: context.site ?? site.url,
    items: [
      ...publicationFeedItems(taggedPubs),
      ...projectFeedItems(taggedProjects),
    ],
  });
};
