import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";
import directoryData from "@/data/directory.json";
import type { DirectoryEntry } from "@/types/content";

const entries = directoryData as DirectoryEntry[];
const states = ["All", ...Array.from(new Set(entries.map((item) => item.state).filter(Boolean))).sort()];

export function DirectoryPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const state = params.get("state") ?? "All";

  const update = (patch: { q?: string; state?: string }) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value && value !== "All" ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return entries.filter(
      (item) =>
        (state === "All" || item.state === state) &&
        `${item.title} ${item.address} ${item.phones.join(" ")} ${item.emails.join(" ")}`.toLowerCase().includes(term),
    );
  }, [query, state]);

  return (
    <>
      <Seo title="Convent Directory" description="Search JMJ Hyderabad Province communities by location, state, phone number or email address." path="/contact/convents" />
      <PageHeader
        eyebrow="Community"
        title="Convent Directory"
        description="Search JMJ communities and institutions by location, state, phone number or email address."
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />
      <PageShell>
        <div role="search" className="toolbar" style={{ ["--cols" as string]: 1 }}>
          <div className="field">
            <label htmlFor="dir-q">Search locations</label>
            <div className="input-icon">
              <Icon name="search" />
              <input id="dir-q" className="input" type="search" value={query} placeholder="Town, phone or email" onChange={(e) => update({ q: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="dir-state">State</label>
            <select id="dir-state" className="select" value={state} onChange={(e) => update({ state: e.target.value })}>
              {states.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="status-line" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "location" : "locations"}
        </p>
        {filtered.length === 0 ? (
          <EmptyState icon="pin" title="No communities match that search" description="Try another town name or choose a different state." />
        ) : (
          <ul className="reset-list grid grid--2">
            {filtered.map((item) => (
              <li key={item.title}>
                <article className="card">
                  <div className="card__body">
                    <div className="row row--between" style={{ marginBottom: 12, alignItems: "flex-start" }}>
                      <h2 style={{ fontSize: "1.15rem" }}>{item.location}</h2>
                      {item.state && <span className="chip">{item.state}</span>}
                    </div>
                    <div className="info-list" style={{ gap: 10, fontSize: "0.92rem" }}>
                      <div>
                        <Icon name="pin" />
                        <span>{item.address || item.lines[0]}</span>
                      </div>
                      {item.phones.map((phone) => (
                        <div key={phone}>
                          <Icon name="phone" />
                          <span>{phone}</span>
                        </div>
                      ))}
                      {item.emails.map((email) => (
                        <div key={email}>
                          <Icon name="mail" />
                          <a href={`mailto:${email}`}>{email}</a>
                        </div>
                      ))}
                      {item.founded && (
                        <div>
                          <Icon name="calendar" />
                          <span>Founded: {item.founded}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </>
  );
}
