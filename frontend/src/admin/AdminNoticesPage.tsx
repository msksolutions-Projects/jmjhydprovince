import { useCallback, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useResource } from "./useResource";
import { AttachmentsField } from "./AttachmentsField";
import { useAttachmentDraft } from "./useAttachmentDraft";
import { ConfirmDialog, Drawer, Empty, LoadError, Pill, SkeletonRows } from "./ui";
import { useToast } from "./adminContext";
import { Counter, StatusSwitch, Toolbar } from "./ManagerParts";
import { useManagerState } from "./useManagerState";
import { apiError, formatDate, type NoticeItem } from "./utils";

const CATEGORIES = ["general", "holiday", "event", "meeting", "urgent", "maintenance", "academic", "administrative"] as const;
const URGENCIES = ["low", "medium", "high", "critical"] as const;
const EMPTY = { title: "", content: "", category: "general", urgency: "medium", status: "published" };
const MIN_CONTENT = 50;

export function AdminNoticesPage() {
  const toast = useToast();
  const { items, loading, error, load, save, remove } = useResource<NoticeItem>("/notices", { limit: 100, status: "" }, "notices");
  const haystack = useCallback((n: NoticeItem) => `${n.title} ${n.content} ${n.category} ${n.urgency}`, []);
  const m = useManagerState(items, haystack);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<NoticeItem | null>(null);
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
  const openEdit = (item: NoticeItem) => {
    setEditingId(item._id);
    setForm({ title: item.title, content: item.content, category: item.category, urgency: item.urgency, status: item.status });
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
    if (form.content.trim().length < MIN_CONTENT) return setFormError(`The notice needs at least ${MIN_CONTENT} characters.`);
    if (uploading) return setFormError("Please wait for the files to finish uploading.");
    setSaving(true);
    try {
      await save({ ...form, attachments: files.list }, editingId);
      files.commit();
      m.setEditorOpen(false);
      toast(editingId ? "Notice updated" : form.status === "published" ? "Notice posted" : "Draft saved");
    } catch (err) {
      setFormError(apiError(err, "Failed to save the notice."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete._id);
      toast("Notice deleted");
      setToDelete(null);
    } catch (err) {
      toast(apiError(err, "Failed to delete the notice."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const actions = (item: NoticeItem) => (
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
          <h1>Notices</h1>
          <p>Announcements shown on the website&rsquo;s Notices page.</p>
        </div>
        <div className="a-head__actions">
          <button type="button" className="a-btn" onClick={openCreate}>
            <Icon name="plus" /> Post notice
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
          placeholder="Search notices"
        />
        {loading ? (
          <SkeletonRows />
        ) : error ? (
          <LoadError message={error} onRetry={load} />
        ) : m.filtered.length === 0 ? (
          items.length === 0 ? (
            <Empty icon="bell" title="No notices yet" text="Post the first announcement for the website." action={<button type="button" className="a-btn" onClick={openCreate}><Icon name="plus" /> Post notice</button>} />
          ) : (
            <Empty icon="search" title="Nothing matches" text="Try another search, status or category." />
          )
        ) : (
          <>
            <div className="a-table-wrap a-only-desktop">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Notice</th>
                    <th>Urgency</th>
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
                        <div className="a-table__sub">{item.content}</div>
                      </td>
                      <td><Pill value={item.urgency} /></td>
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
                    <Pill value={item.urgency} />
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
        title={editingId ? "Edit notice" : "Post a notice"}
        onClose={close}
        footer={
          <>
            <button type="button" className="a-btn a-btn--ghost" onClick={close}>Cancel</button>
            <button type="submit" form="notice-form" className="a-btn" disabled={saving || uploading}>
              {saving ? <span className="a-spin" /> : <Icon name="check" />}
              {saving ? "Saving…" : editingId ? "Save changes" : form.status === "published" ? "Post notice" : "Save draft"}
            </button>
          </>
        }
      >
        <form id="notice-form" className="a-form" onSubmit={handleSave} noValidate>
          {formError && (
            <div className="a-alert a-alert--error" role="alert"><Icon name="alert" /><span>{formError}</span></div>
          )}
          <div className="a-field">
            <label htmlFor="notice-title">Title</label>
            <input id="notice-title" className="a-input" value={form.title} onChange={(e) => set("title")(e.target.value)} required minLength={5} maxLength={200} />
          </div>
          <div className="a-field">
            <label htmlFor="notice-content">Notice</label>
            <textarea id="notice-content" className="a-textarea" style={{ minHeight: 170 }} value={form.content} onChange={(e) => set("content")(e.target.value)} required />
            <Counter value={form.content} min={MIN_CONTENT} label="the notice" />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="notice-category">Category</label>
              <select id="notice-category" className="a-select" value={form.category} onChange={(e) => set("category")(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
              </select>
            </div>
            <div className="a-field">
              <span className="a-label">Urgency</span>
              <div className="a-seg" role="group" aria-label="Urgency">
                {URGENCIES.map((u) => (
                  <button key={u} type="button" aria-pressed={form.urgency === u} onClick={() => set("urgency")(u)} style={{ textTransform: "capitalize" }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <StatusSwitch value={form.status} onChange={set("status")} />
          <AttachmentsField draft={files} id="notice-files" onBusy={setUploading} />
        </form>
      </Drawer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this notice?"
        message={`“${toDelete?.title ?? ""}” will be removed from the website. This cannot be undone.`}
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
