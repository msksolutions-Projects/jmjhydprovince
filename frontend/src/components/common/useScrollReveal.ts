import { useEffect } from "react";

/** Elements that fade/slide in as they scroll into view. */
const SELECTOR = [
  ".section-head",
  ".welcome > *",
  ".feature",
  ".grid > *",
  ".stats > *",
  ".provinces > *",
  ".timeline > li",
  ".news-list > *",
  ".issue",
  ".panel",
  ".explore",
  ".photo-strip > *",
  ".photo-grid > li",
  ".toc",
  ".pager",
  ".quote-band blockquote",
  ".cta-band .container > *",
  ".empty",
].join(",");

const reduceMotion = () =>
  typeof window === "undefined" || !("IntersectionObserver" in window) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Adds a scroll-reveal animation to content inside `root`. Content is fully
 * visible without JavaScript; the hidden start state is only applied here, and
 * anything already on screen is shown immediately (no flash).
 */
export function useScrollReveal(rootId: string, key: string) {
  useEffect(() => {
    if (reduceMotion()) return;
    const root = document.getElementById(rootId);
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );

    const prepare = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.dataset.reveal) return;
        el.dataset.reveal = "1";
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) return; // already visible: leave as is
        if (rect.height > window.innerHeight * 0.9) return; // long text panels: never hide them
        // Stagger siblings in the same row of a grid.
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
        el.classList.add("reveal");
        io.observe(el);
      });
    };

    prepare(root);
    // Content that arrives later (news from the API, "Load more" photos…)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) m.addedNodes.forEach((n) => n instanceof HTMLElement && prepare(n.parentElement ?? n));
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootId, key]);
}
