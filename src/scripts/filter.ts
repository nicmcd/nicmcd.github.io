/**
 * Project filtering with native TypeScript and data-tags.
 *
 * Buttons declare a tag ("*" shows everything); cards declare their tags
 * space-separated in `data-tags`. All projects remain visible when
 * JavaScript is disabled.
 */

/** Pure filter predicate: does a card with `cardTags` match `filter`? */
export function matchesFilter(cardTags: readonly string[], filter: string): boolean {
  return filter === "*" || cardTags.includes(filter);
}

export function initProjectFilter(): void {
  const toolbar = document.querySelector<HTMLElement>("[data-filter-toolbar]");
  const cards = [
    ...document.querySelectorAll<HTMLElement>(".project-card[data-tags]"),
  ];
  if (toolbar === null || cards.length === 0) return;

  const buttons = [
    ...toolbar.querySelectorAll<HTMLButtonElement>("[data-filter-tag]"),
  ];

  const applyFilter = (tag: string): void => {
    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filterTag === tag),
      );
    }
    for (const card of cards) {
      const tags = (card.dataset.tags ?? "").split(/\s+/).filter((t) => t.length > 0);
      card.hidden = !matchesFilter(tags, tag);
    }
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.filterTag ?? "*");
    });
  }
}
