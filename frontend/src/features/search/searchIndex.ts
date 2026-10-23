import { allSections, routeForSlug as routes, toTitleCase } from "@/services/content";
import institutions from "@/data/institutions.json";
import directory from "@/data/directory.json";
import type { DirectoryEntry, Institution } from "@/types/content";

export type SearchGroup =
  | "Pages"
  | "Ministries"
  | "Institutions"
  | "Convent directory"
  | "Administration"
  | "Media";

export interface SearchRecord {
  id: string;
  title: string;
  group: SearchGroup;
  href: string;
  /** Short supporting line shown under the title. */
  detail?: string;
  /** Lower-cased haystack used for matching. */
  haystack: string;
}

const MINISTRY_SLUGS = new Set([
  "formation",
  "education",
  "health-care",
  "social-work",
  "pastoral-and-evangelization",
  "eco-friendliness-and-protection",
]);

const ADMIN_SLUGS = new Set([
  "provincial-superiors",
  "administration-team",
  "province-commissions",
]);

const EXCLUDED_SLUGS = new Set([
  "home",
  "footer",
  "navigation",
  "pages-not-included",
  "points-to-verify-before-publishing",
]);

const routeForSlug = (slug: string) => routes[slug] ?? `/content/${slug}`;

const plain = (markdown: string) =>
  markdown.replace(/[#*_>|`-]/g, " ").replace(/\s+/g, " ").trim();

function buildIndex(): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const section of allSections) {
    if (EXCLUDED_SLUGS.has(section.slug)) continue;
    const group: SearchGroup = MINISTRY_SLUGS.has(section.slug)
      ? "Ministries"
      : ADMIN_SLUGS.has(section.slug)
        ? "Administration"
        : section.slug === "gallery" || section.slug === "news-and-updates"
          ? "Media"
          : "Pages";
    const body = plain(section.markdown);
    records.push({
      id: `section:${section.slug}`,
      title: toTitleCase(section.title),
      group,
      href: routeForSlug(section.slug),
      detail: body.slice(0, 110),
      haystack: `${section.title} ${body}`.toLowerCase(),
    });
  }

  for (const item of institutions as Institution[]) {
    records.push({
      id: `institution:${item.id}`,
      title: item.institution,
      group: "Institutions",
      href: `/institutions/${item.id}`,
      detail: [item.type, item.established && `Established ${item.established}`]
        .filter(Boolean)
        .join(" · "),
      haystack:
        `${item.institution} ${item.type} ${item.courses} ${item.medium} ${item.intake} ${item.established}`.toLowerCase(),
    });
  }

  for (const entry of directory as DirectoryEntry[]) {
    records.push({
      id: `convent:${entry.title}`,
      title: entry.title,
      group: "Convent directory",
      href: `/contact/convents?q=${encodeURIComponent(entry.location)}`,
      detail: [entry.state, entry.founded && `Founded ${entry.founded}`].filter(Boolean).join(" · "),
      haystack:
        `${entry.title} ${entry.location} ${entry.state} ${entry.address} ${entry.emails.join(" ")}`.toLowerCase(),
    });
  }

  return records;
}

export const searchIndex = buildIndex();

export interface SearchHit extends SearchRecord {
  score: number;
}

/** Simple ranked substring search. Title matches outrank body matches. */
export function search(query: string, limit = 24): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: SearchHit[] = [];
  for (const record of searchIndex) {
    const titleIndex = record.title.toLowerCase().indexOf(q);
    const bodyIndex = titleIndex === -1 ? record.haystack.indexOf(q) : -1;
    if (titleIndex === -1 && bodyIndex === -1) continue;
    const score = titleIndex === 0 ? 0 : titleIndex > 0 ? 1 : 2;
    hits.push({ ...record, score });
  }

  return hits.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title)).slice(0, limit);
}

export function groupHits(hits: SearchHit[]) {
  const order: SearchGroup[] = [
    "Pages",
    "Ministries",
    "Institutions",
    "Convent directory",
    "Administration",
    "Media",
  ];
  return order
    .map((group) => ({ group, items: hits.filter((h) => h.group === group) }))
    .filter((g) => g.items.length > 0);
}
