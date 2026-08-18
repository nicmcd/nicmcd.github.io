/**
 * Keyboard-accessible search dialog backed by /index.json.
 *
 * Opened from the header button or the "/" key, closed by Escape (native
 * dialog behavior) or the close button. Arrow keys move through results,
 * Enter follows the active result. Ranking is the deterministic weighted
 * substring matching shared with the unit tests.
 */

import {
  rankDocuments,
  highlightMatches,
  type SearchDocument,
} from "../utils/search.ts";

let documents: SearchDocument[] | null = null;
let activeIndex = -1;

async function loadIndex(): Promise<SearchDocument[]> {
  if (documents === null) {
    const response = await fetch("/index.json");
    if (!response.ok) throw new Error(`Failed to load search index: ${response.status}`);
    documents = (await response.json()) as SearchDocument[];
  }
  return documents;
}

function renderHighlighted(text: string, query: string): string {
  return highlightMatches(text, query)
    .map((part) =>
      part.match ? `<mark>${escapeHtml(part.text)}</mark>` : escapeHtml(part.text),
    )
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function initSearch(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
  const input = document.querySelector<HTMLInputElement>("[data-search-input]");
  const resultsList = document.querySelector<HTMLUListElement>("[data-search-results]");
  const emptyNotice = document.querySelector<HTMLElement>("[data-search-empty]");
  const openButtons = document.querySelectorAll<HTMLButtonElement>("[data-search-open]");
  const closeButton = document.querySelector<HTMLButtonElement>("[data-search-close]");
  if (
    dialog === null ||
    input === null ||
    resultsList === null ||
    emptyNotice === null ||
    closeButton === null
  ) {
    return;
  }

  let currentResults: SearchDocument[] = [];

  const setActive = (index: number): void => {
    activeIndex = index;
    const options = resultsList.querySelectorAll<HTMLAnchorElement>("[role='option']");
    options.forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === index));
      if (i === index) {
        input.setAttribute("aria-activedescendant", option.id);
      }
    });
    if (index === -1) input.setAttribute("aria-activedescendant", "");
  };

  const renderResults = (): void => {
    const query = input.value;
    const ranked = rankDocuments(documents ?? [], query);
    currentResults = ranked.map((r) => r.document);
    resultsList.innerHTML = "";
    emptyNotice.hidden = !(query.trim().length > 0 && currentResults.length === 0);

    currentResults.forEach((doc, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = doc.url;
      a.className = "search-result-link";
      a.id = `search-result-${i}`;
      a.setAttribute("role", "option");
      a.setAttribute("aria-selected", "false");
      a.innerHTML =
        `<span class="search-result-title">${renderHighlighted(doc.title, query)}</span>` +
        `<span class="search-result-kind">${escapeHtml(doc.kind)}</span>` +
        `<p class="search-result-summary">${renderHighlighted(doc.summary, query)}</p>`;
      li.appendChild(a);
      resultsList.appendChild(li);
    });
    setActive(currentResults.length > 0 ? 0 : -1);
  };

  const openDialog = (): void => {
    dialog.showModal();
    void loadIndex()
      .then(() => renderResults())
      .catch(() => {
        emptyNotice.hidden = false;
        emptyNotice.textContent = "Search index failed to load.";
      });
    input.focus();
    input.select();
  };

  openButtons.forEach((button) => button.addEventListener("click", openDialog));
  closeButton.addEventListener("click", () => dialog.close());

  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable;
    if (event.key === "/" && !typing && !dialog.open) {
      event.preventDefault();
      openDialog();
    }
  });

  input.addEventListener("input", renderResults);

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, currentResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const doc = currentResults[activeIndex];
      if (doc !== undefined) {
        dialog.close();
        window.location.assign(doc.url);
      }
    }
  });
}
