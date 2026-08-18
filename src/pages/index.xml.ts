/**
 * Root RSS feed at /index.xml: profile, publications, and projects.
 */

import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../site.config.ts";
import {
  getProjectsSorted,
  getPublicationsSorted,
  getPrimaryAuthor,
} from "../utils/content.ts";
import {
  publicationFeedItems,
  projectFeedItems,
  profileFeedItem,
} from "../utils/feeds.ts";

export const GET: APIRoute = async (context) => {
  const [projects, publications, profile] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
    getPrimaryAuthor(),
  ]);
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: [
      profileFeedItem(profile),
      ...publicationFeedItems(publications),
      ...projectFeedItems(projects),
    ],
  });
};
