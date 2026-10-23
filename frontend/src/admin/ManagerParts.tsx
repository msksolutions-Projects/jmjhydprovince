import { Icon } from "@/components/ui/Icon";
import type { StatusFilter } from "./useManagerState";

export function StatusTabs({
  value,
  counts,
  onChange,
}: {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (value: StatusFilter) => void;
}) {
  const tabs: [StatusFilter, string][] = [
    ["all", "All"],
    ["published", "Published"],
    ["draft", "Drafts"],
  ];
  return (
    <div className="a-tabs" role="tablist" aria-label="Filter by status">
      {tabs.map(([key, label]) => (
        <button key={key} type="button" role="tab" className="a-tab" aria-selected={value === key} onClick={() => onChange(key)}>
          {label}
          <small>{counts[key]}</small>
        </button>
      ))}
    </div>
  );
}

export function Toolbar({
  status,
  counts,
  onStatus,
  query,
  onQuery,
  category,
  onCategory,
  categories,
  placeholder,
}: {
  status: StatusFilter;
  counts: Record<StatusFilter, number>;
  onStatus: (value: StatusFilter) => void;
  query: string;
  onQuery: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  categories: readonly string[];
  placeholder: string;
}) {
  return (
    <div className="a-toolbar">
      <StatusTabs value={status} counts={counts} onChange={onStatus} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "1 1 320px", justifyContent: "flex-end" }}>
        <div className="a-search">
          <Icon name="search" />
          <input className="a-input" type="search" placeholder={placeholder} aria-label={placeholder} value={query} onChange={(e) => onQuery(e.target.value)} />
        </div>
        <select className="a-select" style={{ width: "auto", minWidth: 150 }} aria-label="Filter by category" value={category} onChange={(e) => onCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function StatusSwitch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="a-field">
      <span className="a-label">Visibility</span>
      <div className="a-seg" role="group" aria-label="Visibility">
        <button type="button" aria-pressed={value === "draft"} onClick={() => onChange("draft")}>
          Draft
        </button>
        <button type="button" aria-pressed={value === "published"} onClick={() => onChange("published")}>
          Published
        </button>
      </div>
      <span className="a-hint">{value === "published" ? "Visible on the public website." : "Saved privately; not shown on the website."}</span>
    </div>
  );
}

export function Counter({ value, min, label }: { value: string; min: number; label: string }) {
  const n = value.trim().length;
  return (
    <span className={`a-hint ${n === 0 ? "" : n < min ? "is-bad" : "is-good"}`} aria-live="polite">
      {n} characters{n < min ? ` · ${label} needs at least ${min}` : " ✓"}
    </span>
  );
}
