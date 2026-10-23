import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export type StatusFilter = "all" | "published" | "draft";

/** Shared list state for the news / notices / gallery managers (URL-synced). */
export function useManagerState<T extends { _id: string; status: string; title: string; category: string }>(
  items: T[],
  haystack: (item: T) => string,
) {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as StatusFilter) || "all";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editorOpen, setEditorOpen] = useState(params.get("new") === "1");

  // `?new=1` (from the dashboard quick actions) opens the editor once.
  useEffect(() => {
    if (params.get("new") === "1") {
      setEditorOpen(true);
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const setStatus = (value: StatusFilter) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setParams(next, { replace: true });
  };

  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((i) => i.status === "published").length,
      draft: items.filter((i) => i.status === "draft").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (status === "all" || item.status === status) &&
        (category === "all" || item.category === category) &&
        (!term || haystack(item).toLowerCase().includes(term)),
    );
  }, [items, status, category, query, haystack]);

  return { status, setStatus, query, setQuery, category, setCategory, counts, filtered, editorOpen, setEditorOpen };
}

