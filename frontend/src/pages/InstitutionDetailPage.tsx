import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { ContentMarkdown } from "@/components/common/ContentMarkdown";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Seo } from "@/components/seo/Seo";
import { breadcrumbSchema } from "@/components/seo/schema";
import { Icon } from "@/components/ui/Icon";
import {
  getInstitution,
  groupLabels,
  institutionGroup,
  institutions,
} from "@/features/institutions/useInstitutions";
import { officialProfiles, tidyProfile } from "@/features/institutions/officialProfiles";
import { getSection } from "@/services/content";

/**
 * The Province content holds narrative profiles for some houses only. Where no
 * narrative exists we say so plainly rather than inventing one.
 */
function findNarrative(name: string): string | null {
  try {
    const section = getSection("institutions");
    const heading = name
      .split(",")[0]
      ?.replace(/^(JMJ|St\.?|"|')\s*/i, "")
      .trim()
      .toLowerCase();
    if (!heading || heading.length < 4) return null;
    const blocks = section.markdown.split(/\n(?=## )/);
    const match = blocks.find((block) => {
      const title = block.split("\n")[0]?.toLowerCase() ?? "";
      return title.includes(heading) || heading.includes(title.replace(/^##\s*/, "").trim());
    });
    return match ?? null;
  } catch {
    return null;
  }
}

export function InstitutionDetailPage() {
  const { id = "" } = useParams();
  const institution = getInstitution(id);

  const related = useMemo(
    () =>
      institution
        ? institutions
            .filter((i) => institutionGroup(i.type) === institutionGroup(institution.type) && i.id !== institution.id)
            .slice(0, 6)
        : [],
    [institution],
  );
  const narrative = useMemo(() => (institution ? findNarrative(institution.institution) : null), [institution]);
  const officialProfile = institution ? officialProfiles[institution.id] : undefined;
  const official = useMemo(
    () => (officialProfile?.status === "extracted" && officialProfile.markdown ? tidyProfile(officialProfile.markdown) : null),
    [officialProfile],
  );

  if (!institution) {
    return (
      <>
        <Seo title="Institution not found" path={`/institutions/${id}`} noIndex />
        <PageHeader eyebrow="Institutions" title="Institution not found" breadcrumbs={[{ label: "Institutions", href: "/institutions" }]} />
        <PageShell sidebar={false}>
          <EmptyState
            icon="building"
            title="We could not find that institution"
            description="The link may be out of date. Browse the full directory to find what you need."
            action={
              <Link to="/institutions" className="btn">
                Back to all institutions
              </Link>
            }
          />
        </PageShell>
      </>
    );
  }

  const group = institutionGroup(institution.type);
  const facts = [
    ["Type", institution.type],
    ["Established", institution.established],
    ["Courses", institution.courses],
    ["Medium", institution.medium],
    ["Intake", institution.intake],
  ].filter(([, value]) => value && value !== "—");

  // Previous / next institution in directory (alphabetical) order.
  const ordered = [...institutions].sort((a, b) => a.institution.localeCompare(b.institution));
  const position = ordered.findIndex((i) => i.id === institution.id);
  const prev = ordered[position - 1];
  const next = ordered[position + 1];

  return (
    <>
      <Seo
        title={institution.institution}
        description={`${institution.institution} — ${institution.type}, established ${institution.established}. Part of JMJ Hyderabad Province.`}
        path={`/institutions/${institution.id}`}
        type="article"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Institutions", path: "/institutions" },
          { name: institution.institution, path: `/institutions/${institution.id}` },
        ])}
      />
      <PageHeader
        eyebrow={institution.type}
        title={institution.institution}
        breadcrumbs={[
          { label: "Institutions", href: "/institutions" },
          { label: groupLabels[group], href: `/institutions?group=${group}` },
        ]}
      />

      <PageShell sidebar={false}>
        <div className="two-col">
          <div style={{ minWidth: 0 }}>
            {official ? (
              <article className="panel">
                <div className="eyebrow">Institution profile from the Province website</div>
                <p className="small text-muted">
                  This is the institution&rsquo;s published historical profile. Any enrolment, staffing or programme
                  figures reflect the original page, not necessarily the current academic year.
                </p>
                <ContentMarkdown markdown={official} />
                {officialProfile?.sourceUrl && (
                  <p style={{ marginTop: 20, marginBottom: 0 }}>
                    <a className="link-arrow" href={officialProfile.sourceUrl} target="_blank" rel="noopener noreferrer">
                      View original Province page <Icon name="external" />
                    </a>
                  </p>
                )}
              </article>
            ) : narrative ? (
              <article className="panel">
                <ContentMarkdown markdown={narrative} />
              </article>
            ) : (
              <div className="alert alert--info">
                <Icon name="info" />
                <div>
                  <strong>Detailed profile coming soon</strong>
                  The available directory records provide the basic institution details, but the linked source does not
                  currently supply a complete public profile. Additional information can be added once the provincial
                  office provides it.
                </div>
              </div>
            )}

            {related.length > 0 && (
              <section style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: "1.3rem", marginBottom: 14 }}>Other {groupLabels[group].toLowerCase()} institutions</h2>
                <ul className="reset-list grid grid--2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <article className="card card--link">
                        <div className="card__body" style={{ padding: 16 }}>
                          <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>
                            <Link className="stretched" to={`/institutions/${item.id}`}>
                              {item.institution}
                            </Link>
                          </h3>
                          <span className="tiny text-muted">
                            {item.type} · Est. {item.established}
                          </span>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <nav className="pager" aria-label="Previous and next institution">
              {prev && (
                <Link to={`/institutions/${prev.id}`} rel="prev">
                  <Icon name="arrowLeft" />
                  <span>
                    <small>Previous institution</small>
                    <strong>{prev.institution}</strong>
                  </span>
                </Link>
              )}
              {next && (
                <Link to={`/institutions/${next.id}`} rel="next" className="pager__next">
                  <span>
                    <small>Next institution</small>
                    <strong>{next.institution}</strong>
                  </span>
                  <Icon name="arrowRight" />
                </Link>
              )}
            </nav>
          </div>

          <aside className="panel sticky-md details-first" style={{ padding: 24 }}>
            <div className="eyebrow">Institution details</div>
            <dl className="facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="stack" style={{ marginTop: 16 }}>
              <Link to="/contact" className="btn btn--block">
                Contact the provincial office
              </Link>
              <Link to="/institutions" className="btn btn--outline btn--block">
                <Icon name="arrowLeft" /> All institutions
              </Link>
            </div>
          </aside>
        </div>
      </PageShell>
    </>
  );
}
