import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
import { Seo } from "@/components/seo/Seo";
import { AttachmentList } from "@/features/attachments/AttachmentList";
import { fetchPublishedNews, newsDate } from "@/features/news/news.service";

const formatDate = (date: Date) => date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

export function NewsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-news"],
    queryFn: ({ signal }) => fetchPublishedNews(signal),
    retry: 1,
  });

  return (
    <>
      <Seo title="News & Updates" description="Latest news from JMJ Hyderabad Province" path="/news" />
      <PageHeader eyebrow="Media" title="News & Updates" description="The latest happenings across our Province and institutions." breadcrumbs={[{ label: "Media" }]} />
      <PageShell sidebar={false}>
        {isPending && <LoadingSkeleton rows={3} height={160} />}
        {isError && (
          <EmptyState
            icon="news"
            title="News is not available right now"
            description="We could not reach the news service. Please try again later — in the meantime, the latest newsletter and photographs are available."
            action={
              <div className="row" style={{ justifyContent: "center" }}>
                <Link className="btn" to="/publications">Read News Strings</Link>
                <Link className="btn btn--outline" to="/gallery">View photographs</Link>
              </div>
            }
          />
        )}
        {data && data.length === 0 && (
          <EmptyState icon="news" title="No news articles yet" description="Articles will appear here as soon as the provincial office publishes them." />
        )}
        {data && data.length > 0 && (
          <div className="stack">
            {data.map((article) => (
              <article className="panel" key={article._id} style={{ padding: 24 }}>
                <div className="card__meta">
                  <span className="chip">{article.category}</span>
                  <time dateTime={newsDate(article).toISOString()}>{formatDate(newsDate(article))}</time>
                </div>
                <h2 style={{ fontSize: "1.35rem", margin: "6px 0 8px" }}>{article.title}</h2>
                {article.excerpt && <p className="text-muted">{article.excerpt}</p>}
                <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{article.content}</p>
                <AttachmentList items={article.attachments} />
              </article>
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
