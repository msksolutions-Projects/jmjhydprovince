import { useCallback, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useResource } from "./useResource";
import { AttachmentsField } from "./AttachmentsField";
import { useAttachmentDraft } from "./useAttachmentDraft";
import { ConfirmDialog, Drawer, Empty, LoadError, Pill, SkeletonRows } from "./ui";
import { useToast } from "./adminContext";
import { Counter, StatusSwitch, Toolbar } from "./ManagerParts";
import { useManagerState } from "./useManagerState";
import { apiError, formatDate, type NewsItem } from "./utils";

const CATEGORIES = ["announcements", "celebrations", "education", "healthcare", "social-services", "formation", "environment", "events", "bicentenary", "other"] as const;
const EMPTY = { title: "", excerpt: "", content: "", category: "announcements", status: "published" };
const MIN_CONTENT = 100;

export function AdminNewsPage() {
  const toast = useToast();
  const { items, loading, error, load, save, remove } = useResource<NewsItem>("/news", { limit: 100, status: "" }, "news articles");
  const haystack = useCallback((n: NewsItem) => `${n.title} ${n.excerpt} ${n.category}`, []);
  const m = useManagerState(items, haystack);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const files = useAttachmentDraft();
  const [uploading, setUploading] = useState(false);

  const set = (field: keyof typeof EMPTY) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    files.reset();
    setFormError("");
    m.setEditorOpen(true);
  };
  const openEdit = (item: NewsItem) => {
    setEditingId(item._id);
    setForm({ title: item.title, excerpt: item.excerpt, content: item.content, category: item.category, status: item.status });
    files.reset(item.attachments ?? []);
    setFormError("");
    m.setEditorOpen(true);
  };
  const { setEditorOpen } = m;
  const { discard } = files;
  const close = useCallback(() => {
    discard();
    setEditorOpen(false);
  }, [discard, setEditorOpen]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");
    if (form.title.trim().length < 5) return setFormError("The title needs at least 5 characters.");
    if (!form.excerpt.trim()) return setFormError("Please add a short summary.");
    if (form.content.trim().length < MIN_CONTENT) return setFormError(`The article needs at least ${MIN_CONTENT} characters.`);
    if (uploading) return setFormError("Please wait for the files to finish uploading.");
    setSaving(true);
    try {
      await save({ ...form, attachments: files.list }, editingId);
      files.commit();
      m.setEditorOpen(false);
      toast(editingId ? "Article updated" : form.status === "published" ? "Article published" : "Draft saved");
    } catch (err) {
      setFormError(apiError(err, "Failed to save the article."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete._id);
      toast("Article deleted");
      setToDelete(null);
    } catch (err) {
      toast(apiError(err, "Failed to delete the article."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const actions = (item: NewsItem) => (
    <div className="a-actions">
      <button type="button" className="a-icon-btn" onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`} title="Edit">
        <Icon name="edit" />
      </button>
      <button type="button" className="a-icon-btn a-icon-btn--danger" onClick={() => setToDelete(item)} aria-label={`Delete ${item.title}`} title="Delete">
        <Icon name="trash" />
      </button>
    </div>
  );

  return (
    <>
      <div className="a-head">
        <div>
          <h1>News</h1>
          <p>Articles shown on the website&rsquo;s News &amp; Updates page.</p>
        </div>
        <div className="a-head__actions">
          <button type="button" className="a-btn" onClick={openCreate}>
            <Icon name="plus" /> New article
          </button>
        </div>
      </div>

      <section className="a-card">
        <Toolbar
          status={m.status}
          counts={m.counts}
          onStatus={m.setStatus}
          query={m.query}
          onQuery={m.setQuery}
          category={m.category}
          onCategory={m.setCategory}
          categories={CATEGORIES}
          placeholder="Search articles"
        />
        {loading ? (
          <SkeletonRows />
        ) : error ? (
          <LoadError message={error} onRetry={load} />
        ) : m.filtered.length === 0 ? (
          items.length === 0 ? (
            <Empty icon="news" title="No articles yet" text="Write the first news article for the website." action={<button type="button" className="a-btn" onClick={openCreate}><Icon name="plus" /> New article</button>} />
          ) : (
            <Empty icon="search" title="Nothing matches" text="Try another search, status or category." />
          )
        ) : (
          <>
            <div className="a-table-wrap a-only-desktop">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {m.filtered.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="a-table__title">{item.title}</div>
                        <div className="a-table__sub">{item.excerpt}</div>
                      </td>
                      <td><Pill value={item.category} kind="cat" /></td>
                      <td><Pill value={item.status} /></td>
                      <td style={{ whiteSpace: "nowrap", color: "var(--a-ink-2)" }}>{formatDate(item.createdAt)}</td>
                      <td>{actions(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="a-mobile-list a-only-mobile">
              {m.filtered.map((item) => (
                <div className="a-mobile-item" key={item._id}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="a-table__title">{item.title}</div>
                      <div className="a-list__meta">{formatDate(item.createdAt)}</div>
                    </div>
                    {actions(item)}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Pill value={item.status} />
                    <Pill value={item.category} kind="cat" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Drawer
        open={m.editorOpen}
        title={editingId ? "Edit article" : "New article"}
        onClose={close}
        footer={
          <>
            <button type="button" className="a-btn a-btn--ghost" onClick={close}>Cancel</button>
            <button type="submit" form="news-form" className="a-btn" disabled={saving || uploading}>
              {saving ? <span className="a-spin" /> : <Icon name="check" />}
              {saving ? "Saving…" : editingId ? "Save changes" : form.status === "published" ? "Publish" : "Save draft"}
            </button>
          </>
        }
      >
        <form id="news-form" className="a-form" onSubmit={handleSave} noValidate>
          {formError && (
            <div className="a-alert a-alert--error" role="alert"><Icon name="alert" /><span>{formError}</span></div>
          )}
          <div className="a-field">
            <label htmlFor="news-title">Title</label>
            <input id="news-title" className="a-input" value={form.title} onChange={(e) => set("title")(e.target.value)} required minLength={5} maxLength={200} />
          </div>
          <div className="a-field">
            <label htmlFor="news-excerpt">Summary <small>{form.excerpt.length}/500 · shown in lists</small></label>
            <textarea id="news-excerpt" className="a-textarea" style={{ minHeight: 70 }} value={form.excerpt} onChange={(e) => set("excerpt")(e.target.value)} required maxLength={500} />
          </div>
          <div className="a-field">
            <label htmlFor="news-content">Article</label>
            <textarea id="news-content" className="a-textarea" style={{ minHeight: 200 }} value={form.content} onChange={(e) => set("content")(e.target.value)} required />
            <Counter value={form.content} min={MIN_CONTENT} label="the article" />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="news-category">Category</label>
              <select id="news-category" className="a-select" value={form.category} onChange={(e) => set("category")(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
              </select>
            </div>
            <StatusSwitch value={form.status} onChange={set("status")} />
          </div>
          <AttachmentsField draft={files} id="news-files" onBusy={setUploading} />
        </form>
      </Drawer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this article?"
        message={`“${toDelete?.title ?? ""}” will be removed from the website. This cannot be undone.`}
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
