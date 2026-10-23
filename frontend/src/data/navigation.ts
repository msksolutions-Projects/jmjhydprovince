import type { IconName } from "@/components/ui/Icon";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: IconName;
}

export interface NavGroup {
  /** Stable key, also used for the section sidebar title. */
  id: string;
  label: string;
  /** Landing page for the section (first item when omitted). */
  href?: string;
  items?: NavItem[];
}

/**
 * Site map. Modelled on the Congregation website (congregationjmj.org):
 * About · Province (leadership) · Mission · Community life · Institutions ·
 * Media · Contact. All URLs from the previous build are unchanged.
 */
export const navigation: NavGroup[] = [
  {
    id: "about",
    label: "About Us",
    items: [
      { label: "Our Founder", href: "/who-we-are/founder", icon: "star", description: "Rev. Fr. Mathias Wolff S.J." },
      { label: "Our History", href: "/who-we-are/history", icon: "history", description: "From Holland to India and beyond" },
      { label: "Missionary Work", href: "/who-we-are/missionary-work", icon: "compass", description: "The first sisters in India, 1904" },
      { label: "Vision & Mission", href: "/who-we-are/vision-mission", icon: "eye", description: "Our purpose and charism" },
      { label: "Province Profile", href: "/who-we-are/province-profile", icon: "building", description: "The Province at a glance" },
      { label: "JMJ Worldwide", href: "/who-we-are/our-presence", icon: "globe", description: "Our sister provinces" },
    ],
  },
  {
    id: "province",
    label: "Province",
    items: [
      { label: "Provincial Superiors", href: "/administration/provincial-superiors", icon: "users", description: "Leadership through the years" },
      { label: "Administration Team", href: "/administration/team", icon: "users", description: "Current leadership" },
      { label: "Province Commissions", href: "/administration/commissions", icon: "list", description: "Commissions and members" },
    ],
  },
  {
    id: "mission",
    label: "Mission",
    items: [
      { label: "Education", href: "/ministries/education", icon: "school", description: "Schools, colleges, teacher training" },
      { label: "Health Care", href: "/ministries/health-care", icon: "health", description: "Hospitals and nursing education" },
      { label: "Social Work", href: "/ministries/social-work", icon: "social", description: "With the poor and marginalized" },
      { label: "Pastoral & Evangelization", href: "/ministries/pastoral-evangelization", icon: "church", description: "Presence in parishes and villages" },
      { label: "Eco Friendliness", href: "/ministries/eco-friendliness", icon: "leaf", description: "Care for creation, JPIC" },
      { label: "Safeguarding", href: "/ministries/safeguarding", icon: "shield", description: "Policy and annexure forms" },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      { label: "How We Live", href: "/who-we-are/our-life", icon: "heart", description: "Life, spirituality and vocation" },
      { label: "Formation", href: "/ministries/formation", icon: "users", description: "Stages of becoming a JMJ sister" },
      { label: "Convent Directory", href: "/contact/convents", icon: "pin", description: "All 25 communities" },
    ],
  },
  {
    id: "institutions",
    label: "Institutions",
    href: "/institutions",
    items: [
      { label: "All Institutions", href: "/institutions", icon: "building", description: "Directory of all 32 institutions" },
      { label: "Education", href: "/institutions?group=education", icon: "school", description: "Schools and colleges" },
      { label: "Health Care", href: "/institutions?group=health", icon: "health", description: "Hospitals and clinics" },
      { label: "Social & Pastoral", href: "/institutions?group=social", icon: "social", description: "Homes, boarding, pastoral" },
      { label: "Institution Profiles", href: "/institution-profiles", icon: "book", description: "Written profiles of our houses" },
    ],
  },
  {
    id: "media",
    label: "Media",
    items: [
      { label: "News & Updates", href: "/news", icon: "news", description: "Latest from the Province" },
      { label: "Notices", href: "/notices", icon: "bell", description: "Announcements" },
      { label: "Publications", href: "/publications", icon: "file", description: "News Strings and reflections" },
      { label: "Photo Gallery", href: "/gallery", icon: "image", description: "484 photographs, 12 albums" },
    ],
  },
  { id: "contact", label: "Contact", href: "/contact" },
];

/** Flat list used by the footer and search index. */
export const allNavItems: NavItem[] = navigation.flatMap((group) => group.items ?? []);

export const groupHref = (group: NavGroup) => group.href ?? group.items?.[0]?.href ?? "/";

const pathOf = (href: string) => href.split("?")[0] ?? href;

/** Every group that contains the given path, best match first. */
export function findGroup(pathname: string): NavGroup | undefined {
  // Prefer a group whose items list the exact path (excluding query-string variants).
  const exact = navigation.find((group) =>
    (group.items ?? []).some((item) => !item.href.includes("?") && pathOf(item.href) === pathname),
  );
  if (exact) return exact;
  if (pathname.startsWith("/institutions")) return navigation.find((g) => g.id === "institutions");
  if (pathname.startsWith("/contact")) return navigation.find((g) => g.id === "contact");
  return undefined;
}

export function isGroupActive(group: NavGroup, pathname: string) {
  if (group.href && pathOf(group.href) === pathname) return true;
  return findGroup(pathname)?.id === group.id;
}

/** Previous / next pages inside the same section, for the inner-page pager. */
export function siblings(pathname: string) {
  const group = findGroup(pathname);
  const items = (group?.items ?? []).filter((item) => !item.href.includes("?"));
  const index = items.findIndex((item) => pathOf(item.href) === pathname);
  if (!group || index === -1) return { group, prev: undefined, next: undefined };
  return { group, prev: items[index - 1], next: items[index + 1] };
}

/** Breadcrumb trail (section level) for a path. */
export function crumbsFor(pathname: string) {
  const group = findGroup(pathname);
  if (!group || !group.items) return [];
  const href = groupHref(group);
  return [{ label: group.label, href: href === pathname ? undefined : href }];
}
