import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";
import {
  facets,
  groupLabels,
  institutions,
  institutionGroup,
  useInstitutionFilters,
  type InstitutionGroup,
  type SortKey,
} from "@/features/institutions/useInstitutions";

const groups = Object.keys(groupLabels) as InstitutionGroup[];
const countFor = (group: InstitutionGroup) => institutions.filter((i) => institutionGroup(i.type) === group).length;

export function InstitutionsPage() {
  const { filters, setFilters, reset, isFiltered, results, total } = useInstitutionFilters();
  const groupTitle = filters.group !== "All" ? groupLabels[filters.group as InstitutionGroup] : undefined;

  const sortButton = (key: SortKey, label: string) => (
    <button type="button" className="th-btn" onClick={() => setFilters({ sort: key })} aria-pressed={filters.sort === key}>
      {label}
      {filters.sort === key && <Icon name="sort" />}
    </button>
  );

  return (
    <>
      <Seo
        title={groupTitle ? `${groupTitle} Institutions` : "Institution Directory"}
        description="All institutions of JMJ Hyderabad Province with establishment year, type, courses, medium and intake."
        path="/institutions"
      />
      <PageHeader
        eyebrow="Institutions"
        title={groupTitle ? `${groupTitle} Institutions` : "Institution Directory"}
        description="Every institution of the Province, with establishment year, type, courses, medium and intake as recorded in the Province content."
        breadcrumbs={groupTitle ? [{ label: "Institutions", href: "/institutions" }] : []}
      />

      <PageShell sidebar={false} tabs={false}>
        <div className="filter-chips" role="group" aria-label="Institution category">
          <button type="button" className="filter-chip" aria-pressed={filters.group === "All"} onClick={() => setFilters({ group: "All" })}>
            All ({total})
          </button>
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              className="filter-chip"
              aria-pressed={filters.group === group}
              onClick={() => setFilters({ group })}
            >
              {groupLabels[group]} ({countFor(group)})
            </button>
          ))}
        </div>

        <div role="search" className="toolbar" style={{ ["--cols" as string]: 4 }}>
          <div className="field">
            <label htmlFor="inst-q">Search institutions</label>
            <div className="input-icon">
              <Icon name="search" />
              <input
                id="inst-q"
                className="input"
                type="search"
                value={filters.q}
                placeholder="Name, place or course"
                onChange={(event) => setFilters({ q: event.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="inst-type">Type</label>
            <select id="inst-type" className="select" value={filters.type} onChange={(e) => setFilters({ type: e.target.value })}>
              {facets.type.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="inst-medium">Medium</label>
            <select id="inst-medium" className="select" value={filters.medium} onChange={(e) => setFilters({ medium: e.target.value })}>
              {facets.medium.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="inst-intake">Intake</label>
            <select id="inst-intake" className="select" value={filters.intake} onChange={(e) => setFilters({ intake: e.target.value })}>
              {facets.intake.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="inst-sort">Sort by</label>
            <select id="inst-sort" className="select" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value as SortKey })}>
              <option value="name">Name</option>
              <option value="established">Establishment year</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        <div className="row row--between" style={{ marginBottom: 16 }}>
          <p className="status-line" role="status" aria-live="polite" style={{ margin: 0 }}>
            Showing {results.length} of {total} institutions
          </p>
          {isFiltered && (
            <button type="button" className="btn btn--sm btn--outline" onClick={reset}>
              <Icon name="refresh" /> Reset filters
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState
            title="No institutions match those filters"
            description="Try a different type or medium, or clear the search to see all thirty-two."
            action={
              <button type="button" className="btn btn--outline" onClick={reset}>
                Reset filters
              </button>
            }
          />
        ) : (
          <>
            <ul className="reset-list grid grid--2 only-mobile">
              {results.map((item) => (
                <li key={item.id}>
                  <article className="card card--link">
                    <div className="card__body">
                      <div className="card__meta">
                        <span className="chip">{item.type}</span>
                        <span>Est. {item.established}</span>
                      </div>
                      <h3>
                        <Link className="stretched" to={`/institutions/${item.id}`}>
                          {item.institution}
                        </Link>
                      </h3>
                      <p className="small" style={{ margin: 0 }}>
                        {[item.courses, item.medium && `Medium: ${item.medium}`, item.intake && `Intake: ${item.intake}`]
                          .filter((v) => v && v !== "—")
                          .join(" · ")}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            <div className="table-wrap only-desktop">
              <table aria-label="JMJ institutions">
                <thead>
                  <tr>
                    <th>{sortButton("name", "Institution")}</th>
                    <th>{sortButton("established", "Established")}</th>
                    <th>{sortButton("type", "Type")}</th>
                    <th>Courses</th>
                    <th>Medium</th>
                    <th>Intake</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, minWidth: 240 }}>
                        <Link to={`/institutions/${item.id}`}>{item.institution}</Link>
                      </td>
                      <td>{item.established}</td>
                      <td>
                        <span className="chip">{item.type}</span>
                      </td>
                      <td>{item.courses}</td>
                      <td>{item.medium}</td>
                      <td>{item.intake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="tiny text-muted" style={{ marginTop: 20 }}>
          Establishment years are shown as recorded in the Province content. Where sources conflict, the fact is listed
          in the content verification register and is not presented as settled.
        </p>
        <p>
          <Link className="link-arrow" to="/institution-profiles">
            Read the written institution profiles <Icon name="arrowRight" />
          </Link>
        </p>
      </PageShell>
    </>
  );
}
