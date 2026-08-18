/**
 * Header behavior: mobile disclosure menu, theme toggle, and homepage
 * scrollspy (active-section state). Framework-free TypeScript.
 */

type ThemeName = "light" | "dark";

function currentTheme(): ThemeName {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (toggle !== null) {
    const action = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${action} theme`);
  }
}

function initThemeToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (toggle === null) return;
  applyTheme(currentTheme()); // sync accessible label with initial theme
  toggle.addEventListener("click", () => {
    const next: ThemeName = currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage unavailable (private mode); theme still applies for this page.
    }
    applyTheme(next);
  });
}

function initMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle === null || nav === null) return;

  const setOpen = (open: boolean): void => {
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      nav.removeAttribute("hidden");
    } else {
      nav.setAttribute("hidden", "");
    }
  };

  // Start closed on mobile (the HTML ships hidden; desktop CSS overrides).
  setOpen(toggle.getAttribute("aria-expanded") === "true");

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after choosing a destination, and on Escape.
  nav.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a") !== null) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}

function initScrollspy(): void {
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(".nav-link[data-section]"),
  ];
  if (links.length === 0 || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((link) => document.getElementById(link.dataset.section ?? ""))
    .filter((el): el is HTMLElement => el !== null);
  if (sections.length === 0) return;

  const setActive = (id: string): void => {
    for (const link of links) {
      if (link.dataset.section === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );
  for (const section of sections) observer.observe(section);
}

export function initHeader(): void {
  initThemeToggle();
  initMobileMenu();
  initScrollspy();
}
