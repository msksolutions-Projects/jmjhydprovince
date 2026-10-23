import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useResource } from "./useResource";
import { ConfirmDialog, Drawer, Empty, LoadError, Pill } from "./ui";
import { useToast } from "./adminContext";
import { StatusSwitch, Toolbar } from "./ManagerParts";
import { useManagerState } from "./useManagerState";
import { apiError, formatDate, type GalleryItem } from "./utils";
import { fetchAlbumList, type GalleryCategory } from "@/features/gallery/gallery.service";

const CATEGORIES = ["formation", "education", "healthcare", "social-services", "events", "celebrations", "pilgrimages", "meetings", "other"] as const;
const EMPTY = { title: "", description: "", album: "", category: "events", status: "published" };
const NEW_ALBUM = "__new__";
const MAX_MB = 10;

function DropZone({ file, onFile }: { file: File | null; onFile: (file: File | null) => void }) {
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file && preview) {
    return (
      <figure className="a-drop__preview" style={{ margin: 0 }}>
        <img src={preview} alt="Selected photo preview" />
        <figcaption>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => onFile(null)}>
            Change
          </button>
        </figcaption>
      </figure>
    );
  }

  return (
    <label
      className={`a-drop${over ? " is-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onFile(dropped);
      }}
    >
      <Icon name="upload" />
      <strong>Drop a photo here, or click to choose</strong>
      <span className="a-hint">JPG, PNG or WebP · up to {MAX_MB} MB</span>
      <input type="file" accept="image/*" className="sr-only" aria-label="Choose image file" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </label>
  );
}

export function AdminGalleryPage() {
  const toast = useToast();
  const { items, loading, error, load, save, remove } = useResource<GalleryItem>("/gallery", { limit: 200, status: "" }, "photos");
  const haystack = useCallback((g: GalleryItem) => `${g.title} ${g.description ?? ""} ${g.category}`, []);
  const m = useManagerState(items, haystack);
  const { setEditorOpen } = m;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = (field: keyof typeof EMPTY) => (value: string) => setForm((f) => ({ ...f, [field]: value }));
  const close = useCallback(() => setEditorOpen(false), [setEditorOpen]);

  // Albums shown as filters on the public Photo Gallery page
  const [albums, setAlbums] = useState<GalleryCategory[]>([]);
  const [albumChoice, setAlbumChoice] = useState("");
  useEffect(() => {
    const ctrl = new AbortController();
    fetchAlbumList(ctrl.signal).then(setAlbums).catch(() => {});
    return () => ctrl.abort();
  }, []);
  const customAlbums = [...new Set(items.map((i) => (i.album ?? "").trim()).filter((a) => a && !albums.some((x) => x.id === a)))];
  const albumLabel = (value?: string) => (value ? albums.find((a) => a.id === value)?.label ?? value : "Latest uploads");
  const chooseAlbum = (value: string) => {
    setAlbumChoice(value);
    set("album")(value === NEW_ALBUM ? "" : value);
  };

  const openUpload = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setFormError("");
    setAlbumChoice("");
    setEditorOpen(true);
  };
  const openEdit = (item: GalleryItem) => {
    setEditingId(item._id);
    setForm({ title: item.title, description: item.description ?? "", album: item.album ?? "", category: item.category, status: item.status });
    setAlbumChoice(item.album ?? "");
    setFile(null);
    setFormError("");
    setEditorOpen(true);
  };

  const chooseFile = (next: File | null) => {
    setFormError("");
    if (next && !next.type.startsWith("image/")) return setFormError("Please choose an image file.");
    if (next && next.size > MAX_MB * 1024 * 1024) return setFormError(`The photo is larger than ${MAX_MB} MB.`);
    setFile(next);
    if (next && !form.title) set("title")(next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");
    if (form.title.trim().length < 5) return setFormError("The title needs at least 5 characters.");
    if (!editingId && !file) return setFormError("Please choose a photo to upload.");
    if (albumChoice === NEW_ALBUM && !form.album.trim()) return setFormError("Please type a name for the new album.");
    setSaving(true);
    try {
      if (editingId) {
        await save(form, editingId);
        toast("Photo details updated");
      } else {
        const data = new FormData();
        data.append("image", file!);
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        await save(data, null, { headers: { "Content-Type": "multipart/form-data" } });
        toast("Photo uploaded");
      }
      setEditorOpen(false);
    } catch (err) {
      setFormError(apiError(err, editingId ? "Failed to save changes." : "Upload failed."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete._id);
      toast("Photo deleted");
      setToDelete(null);
    } catch (err) {
      toast(apiError(err, "Failed to delete the photo."), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Gallery</h1>
          <p>Photos uploaded here are managed through the website API.</p>
        </div>
        <div className="a-head__actions">
          <button type="button" className="a-btn" onClick={openUpload}>
            <Icon name="upload" /> Upload photo
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
          placeholder="Search photos"
        />
        {loading ? (
          <div className="a-photos" aria-busy="true" aria-label="Loading">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="a-skel" style={{ aspectRatio: "4 / 3.6" }} />
            ))}
          </div>
        ) : error ? (
          <LoadError message={error} onRetry={load} />
        ) : m.filtered.length === 0 ? (
          items.length === 0 ? (
            <Empty icon="image" title="No photos yet" text="Upload the first photograph to the gallery." action={<button type="button" className="a-btn" onClick={openUpload}><Icon name="upload" /> Upload photo</button>} />
          ) : (
            <Empty icon="search" title="Nothing matches" text="Try another search, status or category." />
          )
        ) : (
          <ul className="a-photos" style={{ listStyle: "none", margin: 0 }}>
            {m.filtered.map((item) => (
              <li key={item._id} className="a-photo">
                <div className="a-photo__img">
                  {item.coverImage?.url ? <img src={item.coverImage.thumbUrl || item.coverImage.url} alt={item.title} loading="lazy" /> : <Icon name="image" size={28} />}
                  <Pill value={item.status} />
                </div>
                <div className="a-photo__body">
                  <div>
                    <div className="a-photo__title" title={item.title}>{item.title}</div>
                    <div className="a-photo__meta">
                      {albumLabel(item.album)} · {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <button type="button" className="a-icon-btn" onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`} title="Edit">
                    <Icon name="edit" />
                  </button>
                  <button type="button" className="a-icon-btn a-icon-btn--danger" onClick={() => setToDelete(item)} aria-label={`Delete ${item.title}`} title="Delete">
                    <Icon name="trash" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Drawer
        open={m.editorOpen}
        title={editingId ? "Edit photo details" : "Upload a photo"}
        onClose={close}
        footer={
          <>
            <button type="button" className="a-btn a-btn--ghost" onClick={close}>Cancel</button>
            <button type="submit" form="gallery-form" className="a-btn" disabled={saving}>
              {saving ? <span className="a-spin" /> : <Icon name={editingId ? "check" : "upload"} />}
              {saving ? (editingId ? "Saving…" : "Uploading…") : editingId ? "Save changes" : "Upload"}
            </button>
          </>
        }
      >
        <form id="gallery-form" className="a-form" onSubmit={handleSave} noValidate>
          {formError && (
            <div className="a-alert a-alert--error" role="alert"><Icon name="alert" /><span>{formError}</span></div>
          )}
          {editingId ? (
            <div className="a-alert a-alert--info">
              <Icon name="info" />
              <span>The image itself cannot be replaced. Delete the photo and upload again to change it.</span>
            </div>
          ) : (
            <DropZone file={file} onFile={chooseFile} />
          )}
          <div className="a-field">
            <label htmlFor="gal-title">Title</label>
            <input id="gal-title" className="a-input" value={form.title} onChange={(e) => set("title")(e.target.value)} required minLength={5} maxLength={200} />
          </div>
          <div className="a-field">
            <label htmlFor="gal-album">Album <small>Filter on the public Photo Gallery</small></label>
            <select id="gal-album" className="a-select" style={{ textTransform: "none" }} value={albumChoice} onChange={(e) => chooseAlbum(e.target.value)}>
              <option value="">Latest uploads (no album)</option>
              {albums.length > 0 && (
                <optgroup label="Existing albums">
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </optgroup>
              )}
              {customAlbums.length > 0 && (
                <optgroup label="Albums created here">
                  {customAlbums.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
              )}
              <option value={NEW_ALBUM}>+ New album…</option>
            </select>
            {albumChoice === NEW_ALBUM && (
              <input className="a-input" aria-label="New album name" placeholder="e.g. Feast Day 2026" maxLength={80} value={form.album} onChange={(e) => set("album")(e.target.value)} />
            )}
            <span className="a-hint">Every upload also appears under &ldquo;Latest uploads&rdquo; on the website.</span>
          </div>
          <div className="a-field">
            <label htmlFor="gal-desc">Description <small>Optional · {form.description.length}/1000</small></label>
            <textarea id="gal-desc" className="a-textarea" style={{ minHeight: 80 }} value={form.description} onChange={(e) => set("description")(e.target.value)} maxLength={1000} />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="gal-category">Category</label>
              <select id="gal-category" className="a-select" value={form.category} onChange={(e) => set("category")(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
              </select>
            </div>
            <StatusSwitch value={form.status} onChange={set("status")} />
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this photo?"
        message={`“${toDelete?.title ?? ""}” will be removed from the gallery. This cannot be undone.`}
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
