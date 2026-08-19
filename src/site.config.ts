/**
 * Central typed site configuration.
 *
 * All navigation, site metadata, contact details, social profiles, theme
 * colors, and project filter definitions live here so pages, layouts, feeds,
 * and tests share a single source of truth.
 */

export interface NavItem {
  /** Visible label. */
  name: string;
  /** Link target. Homepage anchors use `/#section` form. */
  url: string;
  /** Homepage section id this item activates on scroll, if any. */
  sectionId?: string;
  /** True for links that leave the site (e.g. the CV PDF is internal, so false). */
  external: boolean;
}

export interface SocialProfile {
  /** Icon key rendered by the local Icon component. */
  icon: "envelope" | "google-scholar" | "github" | "bitbucket" | "linkedin";
  /** Accessible label. */
  label: string;
  /** Link target. */
  url: string;
}

export interface ProjectFilter {
  /** Button label. */
  name: string;
  /** Tag value matched against project `data-tags`; `*` shows everything. */
  tag: string;
}

export interface ThemeColors {
  primary: string;
  darkBackground: string;
  darkSectionAlt: string;
  darkSectionBase: string;
}

export const site = {
  title: "Nic McDonald",
  description:
    "I am a computer architecture research scientist and software/hardware engineer.",
  url: "https://www.nicm.dev",
  email: "n.mcdonald83@gmail.com",
  cvPath: "/pubs/nicmcdonald_cv.pdf",
  themeColors: {
    primary: "#2962ff",
    darkBackground: "#282a36",
    darkSectionAlt: "#272935",
    darkSectionBase: "#23252f",
  } satisfies ThemeColors,
  navigation: [
    { name: "Home", url: "/#about", sectionId: "about", external: false },
    { name: "Projects", url: "/#projects", sectionId: "projects", external: false },
    { name: "Publications", url: "/#publications", sectionId: "publications", external: false },
    { name: "Experience", url: "/#experience", sectionId: "experience", external: false },
    { name: "Patents", url: "/#patents", sectionId: "patents", external: false },
    { name: "Contact", url: "/#contact", sectionId: "contact", external: false },
    { name: "CV", url: "/pubs/nicmcdonald_cv.pdf", external: false },
  ] satisfies NavItem[],
  social: [
    { icon: "envelope", label: "Email", url: "#contact" },
    {
      icon: "google-scholar",
      label: "Google Scholar",
      url: "https://scholar.google.co.uk/citations?user=9AAqqCsAAAAJ",
    },
    { icon: "github", label: "GitHub", url: "https://github.com/nicmcd" },
    { icon: "bitbucket", label: "Bitbucket", url: "https://bitbucket.com/nicmcd" },
    {
      icon: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/nicmcdonald/",
    },
  ] satisfies SocialProfile[],
  projectFilters: [
    { name: "All", tag: "*" },
    { name: "Networks", tag: "Networks" },
    { name: "Simulation", tag: "Simulation" },
    { name: "C++", tag: "Cpp" },
    { name: "Python", tag: "Python" },
  ] satisfies ProjectFilter[],
} as const;

export type Site = typeof site;
