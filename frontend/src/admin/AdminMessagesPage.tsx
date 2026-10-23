import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import adminApi from "./adminApi";
import { useToast } from "./adminContext";
import { ConfirmDialog, Drawer, Empty, LoadError, SkeletonRows } from "./ui";
import { apiError, formatDate, type ContactMessage } from "./utils";
import { useLiveRefresh } from "./useLiveRefresh";

type Filter = "inbox" | "new" | "replied" | "archived" | "spam";
const FILTERS: [Filter, string][] = [
  ["inbox", "Inbox"],
  ["new", "Unread"],
  ["replied", "Replied"],
  ["archived", "Archived"],
  ["spam", "Spam"],
];

const statusLabel: Record<string, string> = { new: "Unread", read: "Read", replied: "Replied", archived: "Archived", spam: "Possible spam" };
const statusClass: Record<string, string> = { new: "high", read: "draft", replied: "published", archived: "draft", spam: "critical" };

export function AdminMessagesPage() {
  const toast = useToast();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("inbox");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const known = useRef<Set<string> | null>(null);

  /** Loads the inbox; `quiet` refreshes in the background without a spinner. */
  const load = useCallback(
    (quiet = false) => {
      if (!quiet) setLoading(true);
      setError("");
      adminApi
        .get("/contact", { params: { limit: 500 } })
        .then((res) => {
          const list: ContactMessage[] = res.data?.data ?? [];
          if (known.current) {
            const fresh = list.filter((m) => !known.current!.has(m._id) && m.status === "new").length;
            if (fresh) toast(fresh === 1 ? "1 new message arrived" : `${fresh} new messages arrived`, "info");
          }
          known.current = new Set(list.map((m) => m._id));
          setItems(list);
        })
        .catch((err) => !quiet && setError(apiError(err, "Could not load messages.")))
        .finally(() => !quiet && setLoading(false));
    },
    [toast],
  );
  useEffect(() => load(), [load]);
  useLiveRefresh(() => load(true), 20000);

  const counts = useMemo(
    () => ({
      inbox: items.filter((m) => m.status !== "archived" && m.status !== "spam").length,
      new: items.filter((m) => m.status === "new").length,
      replied: items.filter((m) => m.status === "replied").length,
      archived: items.filter((m) => m.status === "archived").length,
      spam: items.filter((m) => m.status === "spam").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter(
      (m) =>
        (filter === "inbox" ? m.status !== "archived" && m.status !== "spam" : m.status === filter) &&
        (!term || `${m.fullName} ${m.email} ${m.subject} ${m.message} ${m.reference}`.toLowerCase().includes(term)),
    );
  }, [items, filter, query]);

  const setStatus = async (message: ContactMessage, status: ContactMessage["status"], note?: string) => {
    try {
      const res = await adminApi.patch(`/contact/${message._id}`, { status });
      const updated = res.data?.data as ContactMessage;
      setItems((list) => list.map((m) => (m._id === updated._id ? updated : m)));
      setOpen((current) => (current && current._id === updated._id ? updated : current));
      if (note) toast(note);
    } catch (err) {
      toast(apiError(err, "Could not update the message."), "error");
    }
  };

  const openMessage = (message: ContactMessage) => {
    setOpen(message);
    if (message.status === "new") void setStatus(message, "read");
    // spam stays flagged until the admin decides
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await adminApi.delete(`/contact/${toDelete._id}`);
      setItems((list) => list.filter((m) => m._id !== toDelete._id));
      if (open?._id === toDelete._id) setOpen(null);
      toast("Message deleted");
      setToDelete(null);
    } catch (err) {
      toast(apiError(err, "Could not delete the message."), "error");
    } finally {
      setBusy(false);
    }
  };

  const replyHref = (m: ContactMessage) =>
    `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject} (${m.reference})`)}&body=${encodeURIComponent(`Dear ${m.fullName},\n\n\n\n— JMJ Hyderabad Province\n\n> ${m.message.split("\n").join("\n> ")}`)}`;

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Messages</h1>
          <p>Enquiries sent through the website&rsquo;s contact form.</p>
        </div>
        <div className="a-head__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => load()}>
            <Icon name="refresh" /> Refresh
          </button>
        </div>
      </div>

      <section className="a-card">
        <div className="a-toolbar">
          <div className="a-tabs" role="tablist" aria-label="Filter messages">
            {FILTERS.map(([key, label]) => (
              <button key={key} type="button" role="tab" className="a-tab" aria-selected={filter === key} onClick={() => setFilter(key)}>
                {label}
                <small>{counts[key]}</small>
              </button>
            ))}
          </div>
          <div className="a-search">
            <Icon name="search" />
            <input className="a-input" type="search" placeholder="Search messages" aria-label="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : error ? (
          <LoadError message={error} onRetry={() => load()} />
        ) : filtered.length === 0 ? (
          items.length === 0 ? (
            <Empty icon="mail" title="No messages yet" text="Messages sent from the website's Contact page will appear here." />
          ) : (
            <Empty icon="search" title="Nothing here" text="No messages match this view." />
          )
        ) : (
          <ul className="a-list">
            {filtered.map((m) => (
              <li key={m._id} className={m.status === "new" ? "a-unread" : undefined}>
                <span className={`a-list__icon ${m.status === "new" ? "tone-amber" : "tone-blue"}`}>
                  <Icon name="mail" />
                </span>
                <button type="button" className="a-list__main a-linklike" onClick={() => openMessage(m)} aria-label={`Open message from ${m.fullName}: ${m.subject}`}>
                  <div className="a-list__title">
                    {m.fullName} · {m.subject}
                  </div>
                  <div className="a-list__meta" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {formatDate(m.createdAt)} · {m.message}
                  </div>
                </button>
                <span className={`a-pill ${statusClass[m.status]}`}>{statusLabel[m.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Drawer
        open={Boolean(open)}
        title={open?.subject ?? "Message"}
        onClose={() => setOpen(null)}
        footer={
          open && (
            <>
              <button type="button" className="a-btn a-btn--ghost" onClick={() => setToDelete(open)}>
                <Icon name="trash" /> Delete
              </button>
              {open.status === "spam" ? (
                <button type="button" className="a-btn a-btn--ghost" onClick={() => void setStatus(open, "read", "Moved to inbox")}>
                  Not spam
                </button>
              ) : open.status !== "archived" ? (
                <button type="button" className="a-btn a-btn--ghost" onClick={() => void setStatus(open, "archived", "Archived")}>
                  Archive
                </button>
              ) : (
                <button type="button" className="a-btn a-btn--ghost" onClick={() => void setStatus(open, "read", "Moved to inbox")}>
                  Move to inbox
                </button>
              )}
              <a className="a-btn" href={replyHref(open)} onClick={() => void setStatus(open, "replied")}>
                <Icon name="send" /> Reply by email
              </a>
            </>
          )
        }
      >
        {open && (
          <div className="a-form">
            <div className="a-msg-meta">
              <span className="a-avatar a-avatar--lg" aria-hidden="true">
                {open.fullName.slice(0, 1).toUpperCase()}
              </span>
              <div style={{ minWidth: 0 }}>
                <strong>{open.fullName}</strong>
                <div><a href={`mailto:${open.email}`}>{open.email}</a></div>
                {open.phone && <div><a href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}>{open.phone}</a></div>}
              </div>
            </div>
            <div className="a-msg-facts">
              <span>Received {new Date(open.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span>Ref. {open.reference}</span>
              <span className={`a-pill ${statusClass[open.status]}`}>{statusLabel[open.status]}</span>
            </div>
            {open.status === "spam" && (
              <div className="a-alert a-alert--warn">
                <Icon name="alert" />
                <span>The hidden anti-spam field was filled when this was sent. It may be a bot, or the sender&rsquo;s browser autofill. If it looks genuine, choose &ldquo;Not spam&rdquo;.</span>
              </div>
            )}
            <div className="a-msg-body">{open.message}</div>
            {open.status !== "replied" && (
              <button type="button" className="a-btn a-btn--soft" onClick={() => void setStatus(open, "replied", "Marked as replied")}>
                <Icon name="check" /> Mark as replied
              </button>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this message?"
        message={`The message from ${toDelete?.fullName ?? ""} will be permanently removed.`}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
