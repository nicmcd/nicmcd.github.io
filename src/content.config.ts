import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * Validated content collections.
 *
 * Every collection requires an explicit `slug` field so underscores in
 * existing URLs (e.g. /publication/hxrouting_sc/) are never altered by
 * Astro's ID handling. Cross-collection references are validated at build
 * time in src/utils/validate.ts (wired into the content validation script).
 */

const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      primary: z.boolean().default(false),
      role: z.string().optional(),
      organization: z
        .object({ name: z.string(), url: z.url() })
        .optional(),
      bio: z.string().optional(),
      interests: z.array(z.string()).default([]),
      education: z
        .array(
          z.object({
            course: z.string(),
            institution: z.string(),
            year: z.number().int(),
          }),
        )
        .default([]),
      social: z
        .array(
          z.object({
            icon: z.enum([
              "envelope",
              "google-scholar",
              "github",
              "bitbucket",
              "linkedin",
            ]),
            label: z.string(),
            url: z.string(),
          }),
        )
        .default([]),
      avatar: image().optional(),
      avatarAlt: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      externalUrl: z.url(),
      image: image(),
      imageAlt: z.string().min(1),
      relatedPublications: z.array(z.string()).default([]),
    }),
});

const publications = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      authors: z.array(z.string()).min(1),
      date: z.coerce.date(),
      type: z.enum(["1", "7"]),
      venue: z.string().min(1),
      venueShort: z.string().default(""),
      abstract: z.string().min(1),
      summary: z.string().min(1),
      tags: z.array(z.string()).default([]),
      doi: z.string().default(""),
      image: image(),
      imageAlt: z.string().min(1),
      projects: z.array(z.string()).default([]),
      pdf: z.string().regex(/^pubs\/.+\.pdf$/),
      slides: z.string().regex(/^pubs\/.+\.pdf$/).optional(),
      bibPath: z.string().regex(/^publication\/.+\/cite\.bib$/),
    }),
});

const experience = defineCollection({
  loader: file("src/content/experience.yaml"),
  schema: z.object({
    order: z.number().int(),
    title: z.string().min(1),
    company: z.string().min(1),
    companyUrl: z.url(),
    location: z.string().min(1),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
    description: z.string().min(1),
  }),
});

export const collections = { authors, projects, publications, experience };
