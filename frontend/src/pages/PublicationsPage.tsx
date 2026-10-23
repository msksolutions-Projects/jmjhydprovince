import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { DocumentCard } from "@/components/common/DocumentCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";
import { fetchPublications } from "@/features/publications/publications.service";

/** Issue number at the start of a title, for newest-first ordering. */
const issueNumber = (title: string) => Number(title.match(/^(\d+)/)?.[1] ?? -1);

export function PublicationsPage() {
  const [query, setQuery] = useState("");
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["publications"],
    queryFn: ({ signal }) => fetchPublications(signal),
    staleTime: Infinity,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = query.trim().toLowerCase();
    const list = term ? data.filter((item) => item.title.toLowerCase().includes(term)) : data;
    return [...list].sort((a, b) => issueNumber(b.title) - issueNumber(a.title));
  }, [data, query]);

  return (
    <>
      <Seo title="Publications" description="News Strings, reflections and spirituality resources published by JMJ Hyderabad Province." path="/publications" />
      <PageHeader
        eyebrow="Media"
        title="Publications"
        description="News Strings, reflections and spirituality resources from the Province archive."
        breadcrumbs={[{ label: "Media", href: "/news" }]}
      />
      <PageShell sidebar={false}>
        <div className="row row--between" style={{ marginBottom: 20 }}>
          <div className="input-icon" style={{ flex: "1 1 260px", maxWidth: 420 }}>
            <Icon name="search" />
            <input className="input" type="search" aria-label="Search publications" placeholder="Search publications" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {data && (
            <p className="status-line" role="status" aria-live="polite" style={{ margin: 0 }}>
              {filtered.length} {filtered.length === 1 ? "publication" : "publications"}
            </p>
          )}
        </div>
        {isPending && <LoadingSkeleton rows={6} height={180} />}
        {isError && <ErrorState title="Publications did not load" message={(error as Error).message} onRetry={() => void refetch()} />}
        {data &&
          (filtered.length === 0 ? (
            <EmptyState
              icon="file"
              title="No publications match that search"
              description="Try a shorter term, or clear the search to see everything in the archive."
              action={
                <button type="button" className="btn btn--outline" onClick={() => setQuery("")}>
                  Clear search
                </button>
              }
            />
          ) : (
            <ul className="reset-list grid grid--3">
              {filtered.map((item) => (
                <li key={item.file}>
                  <DocumentCard title={item.title} file={item.file} bytes={item.bytes} />
                </li>
              ))}
            </ul>
          ))}
      </PageShell>
    </>
  );
}
