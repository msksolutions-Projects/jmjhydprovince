import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import institutionsData from "@/data/institutions.json";
import type { Institution } from "@/types/content";

export const institutions = institutionsData as Institution[];

export type SortKey = "name" | "established" | "type";

export type InstitutionGroup = "education" | "health" | "social";

export const groupLabels: Record<InstitutionGroup, string> = {
  education: "Education",
  health: "Health Care",
  social: "Social, Pastoral & Formation",
};

/** Broad category used by the menu (the source "type" values are very granular). */
export function institutionGroup(type: string): InstitutionGroup {
  if (/health|medical|hospital|clinic/i.test(type)) return "health";
  if (/school|college|b\.ed|cbse/i.test(type)) return "education";
  return "social";
}

export interface InstitutionFilters {
  q: string;
  group: string;
  type: string;
  medium: string;
  intake: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: InstitutionFilters = {
  q: "",
  group: "All",
  type: "All",
  medium: "All",
  intake: "All",
  sort: "name",
};

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

export const facets = {
  type: ["All", ...uniqueSorted(institutions.map((i) => i.type))],
  medium: ["All", ...uniqueSorted(institutions.flatMap((i) => i.medium.split("&").map((m) => m.trim())))],
  intake: ["All", ...uniqueSorted(institutions.map((i) => i.intake))],
};

/** Establishment strings can hold several dates; take the earliest 4-digit year. */
export const earliestYear = (established: string): number => {
  const years = established.match(/\d{4}/g);
  if (!years) return Number.POSITIVE_INFINITY;
  return Math.min(...years.map(Number));
};

/**
 * Filters live in the URL so a filtered view is shareable and the back button
 * behaves the way visitors expect.
 */
export function useInstitutionFilters() {
  const [params, setParams] = useSearchParams();

  const filters: InstitutionFilters = {
    q: params.get("q") ?? DEFAULT_FILTERS.q,
    group: params.get("group") ?? DEFAULT_FILTERS.group,
    type: params.get("type") ?? DEFAULT_FILTERS.type,
    medium: params.get("medium") ?? DEFAULT_FILTERS.medium,
    intake: params.get("intake") ?? DEFAULT_FILTERS.intake,
    sort: (params.get("sort") as SortKey) ?? DEFAULT_FILTERS.sort,
  };

  const setFilters = (patch: Partial<InstitutionFilters>) => {
    const next = { ...filters, ...patch };
    const search = new URLSearchParams();
    (Object.keys(next) as (keyof InstitutionFilters)[]).forEach((key) => {
      if (next[key] !== DEFAULT_FILTERS[key]) search.set(key, String(next[key]));
    });
    setParams(search, { replace: true });
  };

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const isFiltered = (Object.keys(DEFAULT_FILTERS) as (keyof InstitutionFilters)[]).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );

  const results = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    const filtered = institutions.filter((item) => {
      if (filters.group !== "All" && institutionGroup(item.type) !== filters.group) return false;
      if (filters.type !== "All" && item.type !== filters.type) return false;
      if (filters.medium !== "All" && !item.medium.toLowerCase().includes(filters.medium.toLowerCase()))
        return false;
      if (filters.intake !== "All" && item.intake !== filters.intake) return false;
      if (!term) return true;
      return `${item.institution} ${item.type} ${item.courses} ${item.medium} ${item.established}`
        .toLowerCase()
        .includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (filters.sort === "established") return earliestYear(a.established) - earliestYear(b.established);
      if (filters.sort === "type") return a.type.localeCompare(b.type) || a.institution.localeCompare(b.institution);
      return a.institution.localeCompare(b.institution);
    });
  }, [filters.q, filters.group, filters.type, filters.medium, filters.intake, filters.sort]);

  return { filters, setFilters, reset, isFiltered, results, total: institutions.length };
}

export const getInstitution = (id: string) => institutions.find((item) => item.id === id);
