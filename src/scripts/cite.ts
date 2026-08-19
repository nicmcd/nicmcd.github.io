/**
 * Citation dialog behavior.
 *
 * "Cite" buttons open the publication's native <dialog> with formatted
 * BibTeX. "Copy" uses the Clipboard API with a textarea fallback.
 * "Download" is a plain link to the preserved .bib asset.
 */

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard !== undefined) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    // `execCommand` is deprecated but remains the only copy path in
    // legacy browsers without the Clipboard API; access it through a
    // structural type so the deprecated DOM declaration is not used.
    const legacy = document as unknown as {
      execCommand(commandId: string): boolean;
    };
    ok = legacy.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}

export function initCiteDialogs(): void {
  // Open buttons carry the target dialog id.
  document
    .querySelectorAll<HTMLButtonElement>("[data-cite-open]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.citeOpen;
        const dialog = id === undefined ? null : document.getElementById(id);
        if (dialog instanceof HTMLDialogElement) dialog.showModal();
      });
    });

  document.querySelectorAll<HTMLDialogElement>("dialog.cite-dialog").forEach((dialog) => {
    dialog
      .querySelectorAll<HTMLButtonElement>("[data-cite-close]")
      .forEach((button) =>
        button.addEventListener("click", () => dialog.close()),
      );

    const copyButton = dialog.querySelector<HTMLButtonElement>("[data-cite-copy]");
    const copyLabel = dialog.querySelector<HTMLElement>("[data-cite-copy-label]");
    const content = dialog.querySelector<HTMLElement>("[data-cite-content]");
    if (copyButton === null || content === null) return;
    copyButton.addEventListener("click", () => {
      void copyText(content.innerText).then((ok) => {
        if (copyLabel !== null) {
          copyLabel.textContent = ok ? "Copied!" : "Copy failed";
          setTimeout(() => {
            copyLabel.textContent = "Copy";
          }, 2000);
        }
      });
    });
  });
}
