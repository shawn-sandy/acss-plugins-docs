/**
 * Shared runtime for acss-docs visual primitives.
 * Reads CSS custom-property values after render and keeps them in sync when the theme changes.
 */

export function populateValues(root: Document | ParentNode = document): void {
  const els = (root as Document).querySelectorAll
    ? (root as Document).querySelectorAll<HTMLElement>("[data-token-value]")
    : (document as Document).querySelectorAll<HTMLElement>(
        "[data-token-value]",
      );

  els.forEach((el) => {
    const token = el.dataset.tokenValue;
    if (!token) return;

    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();

    if (value) {
      el.textContent = value;
      el.removeAttribute("data-missing");
    } else {
      el.textContent = "—";
      el.setAttribute("data-missing", "");
      if (import.meta.env.DEV) {
        console.warn(`[acss-docs] Token "${token}" not found on :root`);
      }
    }
  });
}

export function watchThemeChanges(callback: () => void): void {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "data-theme") {
        callback();
        break;
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
