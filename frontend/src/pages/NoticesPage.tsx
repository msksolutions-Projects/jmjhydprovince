import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
import { Seo } from "@/components/seo/Seo";
import { AttachmentList } from "@/features/attachments/AttachmentList";
import { fetchPublishedNotices } from "@/features/notices/notices.service";
import { newsDate } from "@/features/news/news.service";

const urgencyClass = (u: string) => (u === "critical" ? "chip chip--error" : u === "high" ? "chip chip--warn" : "chip");

export function NoticesPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-notices"],
    queryFn: ({ signal }) => fetchPublishedNotices(signal),
    retry: 1,
  });

  return (
    <>
      <Seo title="Notices" description="Announcements and notices from JMJ Hyderabad Province" path="/notices" />
      <PageHeader eyebrow="Media" title="Notices" description="Important announcements from the Province." breadcrumbs={[{ label: "Media", href: "/news" }]} />
      <PageShell sidebar={false}>
        {isPending && <LoadingSkeleton rows={3} height={140} />}
        {isError && (
          <EmptyState icon="bell" title="Notices are not available right now" description="We could not reach the notices service. Please try again later." />
        )}
        {data && data.length === 0 && <EmptyState icon="bell" title="No notices have been posted yet" />}
        {data && data.length > 0 && (
          <div className="stack">
            {data.map((notice) => (
              <article className="panel" key={notice._id} style={{ padding: 24 }}>
                <div className="card__meta">
                  <span className={urgencyClass(notice.urgency)}>{notice.urgency}</span>
                  <span className="chip chip--outline">{notice.category}</span>
                  <time dateTime={newsDate(notice).toISOString()}>
                    {newsDate(notice).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                </div>
                <h2 style={{ fontSize: "1.3rem", margin: "6px 0 8px" }}>{notice.title}</h2>
                <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{notice.content}</p>
                <AttachmentList items={notice.attachments} />
              </article>
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
