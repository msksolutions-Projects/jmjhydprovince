import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { groupHref, navigation, siblings } from "@/data/navigation";
import { site } from "@/data/site";

/** The section's own pages, shown as a sticky sidebar on desktop and after the content on mobile. */
function SectionSidebar({ pathname }: { pathname: string }) {
  const { group } = siblings(pathname);
  if (!group?.items) return null;
  return (
    <aside className="sidebar" aria-label={`${group.label} pages`}>
      <nav className="sidenav" aria-label={`In this section: ${group.label}`}>
        <h2 className="sidenav__title">
          <Link to={groupHref(group)}>{group.label}</Link>
        </h2>
        <ul>
          {group.items.map((item) => {
            const current = item.href === pathname;
            return (
              <li key={item.href}>
                <Link to={item.href} aria-current={current ? "page" : undefined}>
                  {item.label}
                  <Icon name="chevronRight" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="side-card">
        <h3>Need to reach us?</h3>
        <p>The provincial office at Somajiguda is open Monday to Saturday, 08:00–18:00.</p>
        <a className="btn btn--light btn--sm" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>
          <Icon name="phone" /> {site.phone}
        </a>
        <Link className="btn btn--ghost-light btn--sm" to="/contact" style={{ marginTop: 8 }}>
          Write to us
        </Link>
      </div>
    </aside>
  );
}

/** Mobile-only horizontal tabs for the section's pages, shown above the content. */
function SectionTabs({ pathname, always = false }: { pathname: string; always?: boolean }) {
  const { search } = useLocation();
  const { group } = siblings(pathname);
  if (!group?.items) return null;
  const isCurrent = (href: string) => {
    const [path, query] = href.split("?");
    return query ? pathname === path && search.includes(query) : pathname === path && !search.includes("group=");
  };
  return (
    <nav className={`section-tabs${always ? " section-tabs--always" : ""}`} aria-label={`${group.label} pages`}>
      {group.items.map((item) => (
        <Link key={item.href} to={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Previous / next page within the section. */
export function Pager({ pathname }: { pathname: string }) {
  const { prev, next } = siblings(pathname);
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Previous and next pages">
      {prev && (
        <Link to={prev.href} rel="prev">
          <Icon name="arrowLeft" />
          <span>
            <small>Previous</small>
            <strong>{prev.label}</strong>
          </span>
        </Link>
      )}
      {next && (
        <Link to={next.href} rel="next" className="pager__next">
          <span>
            <small>Next</small>
            <strong>{next.label}</strong>
          </span>
          <Icon name="arrowRight" />
        </Link>
      )}
    </nav>
  );
}

const exploreIcons: Record<string, Parameters<typeof Icon>[0]["name"]> = {
  about: "star",
  province: "users",
  mission: "heart",
  community: "church",
  institutions: "building",
  media: "image",
  contact: "mail",
};

/** Links to every other top-level section, so no page is a dead end. */
export function ExploreSections({ pathname }: { pathname: string }) {
  const current = siblings(pathname).group?.id;
  const groups = navigation.filter((group) => group.id !== current);
  return (
    <section className="explore" aria-labelledby="explore-title">
      <h2 id="explore-title">Explore more</h2>
      <div className="explore-grid">
        {groups.map((group) => (
          <Link key={group.id} to={groupHref(group)}>
            <Icon name={exploreIcons[group.id] ?? "arrowRight"} />
            {group.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export interface PageShellProps {
  children: ReactNode;
  /** Show the section sidebar (default true when the page belongs to a section). */
  sidebar?: boolean;
  /** Show the explore-more links (default true). */
  explore?: boolean;
  /** Show the section tabs above full-width content (default true). */
  tabs?: boolean;
}

/** Standard inner page body: section sidebar + content + pager + explore links. */
export function PageShell({ children, sidebar = true, explore = true, tabs = true }: PageShellProps) {
  const { pathname } = useLocation();
  const inSection = Boolean(siblings(pathname).group?.items);
  const hasSection = sidebar && inSection;
  return (
    <div className="page-body">
      <div className="container">
        {hasSection ? (
          <div className="with-sidebar">
            <SectionSidebar pathname={pathname} />
            <div style={{ minWidth: 0 }}>
              <SectionTabs pathname={pathname} />
              {children}
              <Pager pathname={pathname} />
            </div>
          </div>
        ) : (
          <>
            {inSection && tabs && <SectionTabs pathname={pathname} always />}
            {children}
            <Pager pathname={pathname} />
          </>
        )}
        {explore && <ExploreSections pathname={pathname} />}
      </div>
    </div>
  );
}
