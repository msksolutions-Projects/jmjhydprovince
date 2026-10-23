import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { groupHits, search } from "./searchIndex";

export interface GlobalSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = ["Kurnool", "Formation", "Hospital", "Founder", "Safeguarding"];

/** Wraps the first occurrence of the query in a <mark> so matches are visible. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q.length < 2) return <>{text}</>;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

export function GlobalSearchDialog({ open, onClose }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const hits = useMemo(() => search(query), [query]);
  const groups = useMemo(() => groupHits(hits), [hits]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    setQuery("");
    setActiveIndex(0);
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.classList.remove("no-scroll");
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    navigate(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && flat[activeIndex]) {
      event.preventDefault();
      go(flat[activeIndex].href);
    }
  };

  const tooShort = query.trim().length < 2;
  let running = -1;

  return (
    <div className="search-dialog" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="global-search-title" onKeyDown={onKeyDown}>
        <h2 id="global-search-title" className="visually-hidden">
          Search the website
        </h2>
        <div className="search-dialog__head">
          <div className="input-icon">
            <Icon name="search" />
            <input
              ref={inputRef}
              className="input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages, ministries, institutions, convents…"
              aria-label="Search this website"
              aria-describedby="global-search-status"
              aria-controls="global-search-results"
              aria-activedescendant={flat[activeIndex] ? `search-hit-${activeIndex}` : undefined}
              autoComplete="off"
            />
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
            <Icon name="close" />
          </button>
        </div>

        <p id="global-search-status" role="status" className="visually-hidden">
          {tooShort ? "Type at least two characters to search." : `${flat.length} ${flat.length === 1 ? "result" : "results"} found.`}
        </p>

        <div className="search-dialog__results" ref={listRef} id="global-search-results" role="listbox" aria-label="Search results">
          {tooShort && (
            <div className="search-hint">
              Search across pages, ministries, all 32 institutions and the convent directory.
              <div className="search-suggest">
                {suggestions.map((term) => (
                  <button key={term} type="button" className="filter-chip" onClick={() => setQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!tooShort && flat.length === 0 && (
            <div className="search-hint">
              <strong>No matches for “{query.trim()}”</strong>
              <br />
              Try a town name, an institution, or a ministry such as “education”.
            </div>
          )}
          {groups.map((group) => (
            <div key={group.group} role="group" aria-label={group.group}>
              <div className="search-group">{group.group}</div>
              {group.items.map((hit) => {
                running += 1;
                const index = running;
                return (
                  <button
                    key={hit.id}
                    id={`search-hit-${index}`}
                    data-index={index}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className="search-hit"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(hit.href)}
                  >
                    <strong>
                      <Highlight text={hit.title} query={query} />
                    </strong>
                    {hit.detail && <span>{hit.detail}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
