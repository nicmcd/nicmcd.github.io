import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../../site.config.ts";
import { getProjectsSorted } from "../../utils/content.ts";
import { projectFeedItems } from "../../utils/feeds.ts";

export const GET: APIRoute = async (context) => {
  const projects = await getProjectsSorted();
  return rss({
    title: `Projects | ${site.title}`,
    description: "Projects",
    site: context.site ?? site.url,
    items: projectFeedItems(projects),
  });
};
