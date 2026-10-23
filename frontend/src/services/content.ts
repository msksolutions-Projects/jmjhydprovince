import data from "@/data/content.json";
import type { ContentData, ContentSection } from "@/types/content";

const content = data as ContentData;
export const allSections = content.sections;

export function getSection(slug: string): ContentSection {
  const section = content.sections.find((item) => item.slug === slug);
  if (!section) throw new Error(`Content section not found: ${slug}`);
  return section;
}

export function searchContent(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return content.sections
    .filter((section) => `${section.title} ${section.markdown}`.toLowerCase().includes(normalized))
    .slice(0, 12);
}

/** Titles in the source are upper-case; render them in title case. */
export const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .replace(/\bJmj\b/g, "JMJ")
    .replace(/\bT\.l\.c\.\b/gi, "T.L.C.")
    .replace(/\bAnd\b/g, "and");

/** Public route for each content section. */
export const routeForSlug: Record<string, string> = {
  "our-founder": "/who-we-are/founder",
  "our-history": "/who-we-are/history",
  "missionary-work": "/who-we-are/missionary-work",
  "vision-mission": "/who-we-are/vision-mission",
  "province-profile": "/who-we-are/province-profile",
  "the-congregation-worldwide": "/who-we-are/our-presence",
  formation: "/ministries/formation",
  education: "/ministries/education",
  "health-care": "/ministries/health-care",
  "social-work": "/ministries/social-work",
  "pastoral-and-evangelization": "/ministries/pastoral-evangelization",
  "eco-friendliness-and-protection": "/ministries/eco-friendliness",
  "provincial-superiors": "/administration/provincial-superiors",
  "administration-team": "/administration/team",
  "province-commissions": "/administration/commissions",
  institutions: "/institution-profiles",
  "institutions-master-table": "/institutions",
  "contact-us-convent-directory": "/contact/convents",
  gallery: "/gallery",
  "news-and-updates": "/news",
};
