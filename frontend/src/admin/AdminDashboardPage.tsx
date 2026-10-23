import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import adminApi from "./adminApi";
import { useAdmin } from "./adminContext";
import { Pill } from "./ui";
import { useLiveRefresh } from "./useLiveRefresh";
import { apiError, firstName, formatDate, timeOfDay, type GalleryItem, type NewsItem, type NoticeItem } from "./utils";

interface Data {
  news: NewsItem[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  unread: number;
  messages: number;
}

type Activity = { id: string; kind: "News" | "Notice" | "Photo"; title: string; status: string; date: string; to: string };

const kindStyle: Record<Activity["kind"], { icon: IconName; tone: string }> = {
  News: { icon: "news", tone: "tone-blue" },
  Notice: { icon: "bell", tone: "tone-amber" },
  Photo: { icon: "image", tone: "tone-violet" },
};

export function AdminDashboardPage() {
  const { admin } = useAdmin();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError("");
    const get = (path: string, limit: number) =>
      adminApi.get(path, { params: { status: "", limit } }).then((r) => (r.data?.data ?? []) as never[]);
    const inbox = adminApi
      .get("/contact", { params: { limit: 500 } })
      .then((r) => ({ unread: Number(r.data?.unread) || 0, messages: (r.data?.data ?? []).length }))
      .catch(() => ({ unread: 0, messages: 0 }));
    Promise.all([get("/news", 100), get("/notices", 100), get("/gallery", 200), inbox])
      .then(([news, notices, gallery, box]) => setData({ news, notices, gallery, ...box }))
      .catch((err) => setError(apiError(err, "Could not load the dashboard figures.")));
  }, [attempt]);

  useLiveRefresh(() => setAttempt((n) => n + 1), 60000);

  const count = <T extends { status: string }>(list: T[] | undefined, status?: string) =>
    list ? (status ? list.filter((i) => i.status === status).length : list.length) : null;

  const urgent = data?.notices.filter((n) => n.status === "published" && (n.urgency === "high" || n.urgency === "critical")).length ?? null;
  const drafts = data ? count(data.news, "draft")! + count(data.notices, "draft")! + count(data.gallery, "draft")! : null;

  const activity: Activity[] = data
    ? [
        ...data.news.map((n) => ({ id: n._id, kind: "News" as const, title: n.title, status: n.status, date: n.updatedAt ?? n.createdAt, to: "/admin/news" })),
        ...data.notices.map((n) => ({ id: n._id, kind: "Notice" as const, title: n.title, status: n.status, date: n.updatedAt ?? n.createdAt, to: "/admin/notices" })),
        ...data.gallery.map((g) => ({ id: g._id, kind: "Photo" as const, title: g.title, status: g.status, date: g.createdAt, to: "/admin/gallery" })),
      ]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 7)
    : [];

  const total = data ? data.news.length + data.notices.length + data.gallery.length : 0;
  const share = (n: number) => (total ? `${(n / total) * 100}%` : "0%");

  const stats: { label: string; value: number | null; meta: string; icon: IconName; tone: string; to: string }[] = [
    { label: "News articles", value: count(data?.news), meta: `${count(data?.news, "published") ?? "–"} published`, icon: "news", tone: "tone-blue", to: "/admin/news" },
    { label: "Notices", value: count(data?.notices), meta: `${urgent ?? "–"} high priority live`, icon: "bell", tone: "tone-amber", to: "/admin/notices" },
    { label: "Gallery photos", value: count(data?.gallery), meta: `${count(data?.gallery, "published") ?? "–"} visible on site`, icon: "image", tone: "tone-violet", to: "/admin/gallery" },
    { label: "Messages", value: data ? data.unread : null, meta: data ? `unread of ${data.messages} total` : "Contact form", icon: "mail", tone: "tone-green", to: "/admin/messages" },
  ];

  return (
    <>
      <section className="a-hero">
        <div>
          <div className="a-hero__date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          <h1>
            {timeOfDay()}, {firstName(admin?.name)}
          </h1>
          <p>
            Here is what is happening on the Province website.
            {drafts ? ` ${drafts} draft${drafts === 1 ? "" : "s"} waiting to be published.` : ""}
          </p>
        </div>
        <div className="a-head__actions">
          <Link className="a-btn" to="/admin/news?new=1">
            <Icon name="plus" /> New article
          </Link>
          <Link className="a-btn a-btn--glass" to="/admin/gallery?new=1">
            <Icon name="upload" /> Upload photo
          </Link>
        </div>
      </section>

      {error && (
        <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 18 }}>
          <Icon name="alert" />
          <span>{error}</span>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => setAttempt((n) => n + 1)}>
            <Icon name="refresh" /> Retry
          </button>
        </div>
      )}

      <div className="a-stats">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="a-card a-stat">
            <span className={`a-stat__icon ${s.tone}`}>
              <Icon name={s.icon} />
            </span>
            <span className="a-stat__value">{s.value ?? (error ? "–" : <span className="a-skel" style={{ display: "block", width: 56, height: 30 }} />)}</span>
            <span className="a-stat__label">{s.label}</span>
            <span className="a-stat__meta">{s.meta}</span>
          </Link>
        ))}
      </div>

      <div className="a-grid-2">
        <section className="a-card" aria-labelledby="recent-title">
          <div className="a-card__head">
            <h2 id="recent-title">Recent activity</h2>
            <span className="a-hint">Latest changes across all content</span>
          </div>
          {!data && !error ? (
            <div className="a-card__body">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="a-skel" style={{ height: 40, marginBottom: 12 }} />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty__icon"><Icon name="trend" /></div>
              <h3>No content yet</h3>
              <p>Your first article, notice or photo will appear here.</p>
            </div>
          ) : (
            <ul className="a-list">
              {activity.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <span className={`a-list__icon ${kindStyle[item.kind].tone}`}>
                    <Icon name={kindStyle[item.kind].icon} />
                  </span>
                  <div className="a-list__main">
                    <Link to={item.to} className="a-list__title" style={{ color: "inherit", display: "block" }}>
                      {item.title}
                    </Link>
                    <div className="a-list__meta">
                      {item.kind} · {formatDate(item.date)}
                    </div>
                  </div>
                  <Pill value={item.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <section className="a-card" aria-labelledby="quick-title">
            <div className="a-card__head">
              <h2 id="quick-title">Quick actions</h2>
            </div>
            <div className="a-card__body a-quick">
              <Link to="/admin/news?new=1">
                <span className="a-list__icon tone-blue"><Icon name="news" /></span>
                <span>Write a news article<small>Announcements, celebrations, events</small></span>
                <Icon name="chevronRight" />
              </Link>
              <Link to="/admin/notices?new=1">
                <span className="a-list__icon tone-amber"><Icon name="bell" /></span>
                <span>Post a notice<small>Holidays, meetings, urgent updates</small></span>
                <Icon name="chevronRight" />
              </Link>
              <Link to="/admin/gallery?new=1">
                <span className="a-list__icon tone-violet"><Icon name="upload" /></span>
                <span>Upload a photo<small>Add to the gallery</small></span>
                <Icon name="chevronRight" />
              </Link>
            </div>
          </section>

          <section className="a-card" aria-labelledby="mix-title">
            <div className="a-card__head">
              <h2 id="mix-title">Content overview</h2>
              <span className="a-hint">{data ? `${total} items` : ""}</span>
            </div>
            <div className="a-card__body">
              <div className="a-bar" role="img" aria-label={data ? `${data.news.length} news, ${data.notices.length} notices, ${data.gallery.length} photos` : "Loading"}>
                <span style={{ width: share(data?.news.length ?? 0), background: "#2c83be" }} />
                <span style={{ width: share(data?.notices.length ?? 0), background: "#d9a440" }} />
                <span style={{ width: share(data?.gallery.length ?? 0), background: "#6d4fc2" }} />
              </div>
              <div className="a-legend">
                <span><i style={{ background: "#2c83be" }} />News {data?.news.length ?? "–"}</span>
                <span><i style={{ background: "#d9a440" }} />Notices {data?.notices.length ?? "–"}</span>
                <span><i style={{ background: "#6d4fc2" }} />Photos {data?.gallery.length ?? "–"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
