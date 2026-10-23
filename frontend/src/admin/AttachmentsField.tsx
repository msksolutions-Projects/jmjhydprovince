import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ACCEPT, MAX_ATTACHMENTS, MAX_FILE_MB, fileLabel, formatSize, type Attachment } from "@/features/attachments/attachments";
import adminApi from "./adminApi";
import { apiError } from "./utils";
import type { AttachmentDraft } from "./useAttachmentDraft";

type Draft = AttachmentDraft;

interface Pending {
  id: number;
  name: string;
  progress: number;
  error?: string;
}

export function AttachmentsField({ draft, id, onBusy }: { draft: Draft; id: string; onBusy?: (busy: boolean) => void }) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const active = useRef(0);
  const { list, setList, markFresh, drop } = draft;

  const update = (pid: number, patch: Partial<Pending>) =>
    setPending((p) => p.map((x) => (x.id === pid ? { ...x, ...patch } : x)));

  const uploadOne = async (file: File) => {
    const pid = ++seq.current;
    setPending((p) => [...p, { id: pid, name: file.name, progress: 0 }]);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      update(pid, { error: `Larger than ${MAX_FILE_MB} MB` });
      return;
    }
    active.current += 1;
    onBusy?.(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await adminApi.post("/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => e.total && update(pid, { progress: Math.round((e.loaded / e.total) * 100) }),
      });
      const att = res.data.data as Attachment;
      markFresh(att);
      setList((l) => [...l, att]);
      setPending((p) => p.filter((x) => x.id !== pid));
    } catch (err) {
      update(pid, { error: apiError(err, "Upload failed") });
    } finally {
      active.current -= 1;
      if (active.current === 0) onBusy?.(false);
    }
  };

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const room = MAX_ATTACHMENTS - list.length - pending.filter((p) => !p.error).length;
    const chosen = Array.from(files);
    chosen.slice(0, Math.max(0, room)).forEach((f) => void uploadOne(f));
    if (chosen.length > room) {
      const pid = ++seq.current;
      setPending((p) => [...p, { id: pid, name: `${chosen.length - Math.max(0, room)} file(s) skipped`, progress: 0, error: `Up to ${MAX_ATTACHMENTS} attachments` }]);
    }
  };

  const remove = (a: Attachment) => {
    setList((l) => l.filter((x) => x.url !== a.url));
    drop(a);
  };

  const move = (index: number, dir: -1 | 1) =>
    setList((l) => {
      const next = [...l];
      const j = index + dir;
      if (j < 0 || j >= next.length) return l;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });

  return (
    <div className="a-field">
      <label htmlFor={id}>
        Attachments <small>{list.length}/{MAX_ATTACHMENTS} · PDF, Word, Excel, PowerPoint or photos</small>
      </label>
      <label
        className={`a-drop a-drop--compact${over ? " is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <Icon name="upload" />
        <span>
          <strong>Choose files</strong> or drag them here
        </span>
        <span className="a-hint">Up to {MAX_FILE_MB} MB each</span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={ACCEPT}
          className="visually-hidden"
          disabled={list.length >= MAX_ATTACHMENTS}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {(list.length > 0 || pending.length > 0) && (
        <ul className="a-files" aria-label="Attached files">
          {list.map((a, i) => (
            <li key={a.url} className="a-file">
              {a.kind === "image" ? (
                <img src={a.thumbUrl || a.url} alt="" className="a-file__thumb" />
              ) : (
                <span className={`a-file__badge a-file__badge--${a.kind}`}>{fileLabel(a)}</span>
              )}
              <a className="a-file__name" href={a.url} target="_blank" rel="noopener noreferrer" title={a.name}>
                {a.name}
              </a>
              <span className="a-file__size">{formatSize(a.size)}</span>
              <span className="a-file__actions">
                <button type="button" className="a-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${a.name} up`} title="Move up">
                  <Icon name="chevronUp" />
                </button>
                <button type="button" className="a-icon-btn a-icon-btn--danger" onClick={() => remove(a)} aria-label={`Remove ${a.name}`} title="Remove">
                  <Icon name="close" />
                </button>
              </span>
            </li>
          ))}
          {pending.map((p) => (
            <li key={`p${p.id}`} className={`a-file${p.error ? " is-error" : ""}`}>
              <span className="a-file__badge">{p.error ? "!" : `${p.progress}%`}</span>
              <span className="a-file__name">{p.name}</span>
              <span className="a-file__size">{p.error ?? "Uploading…"}</span>
              <span className="a-file__actions">
                {p.error ? (
                  <button type="button" className="a-icon-btn" onClick={() => setPending((x) => x.filter((y) => y.id !== p.id))} aria-label={`Dismiss ${p.name}`}>
                    <Icon name="close" />
                  </button>
                ) : (
                  <span className="a-spin" aria-hidden="true" />
                )}
              </span>
              {!p.error && <span className="a-file__bar" style={{ width: `${p.progress}%` }} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
