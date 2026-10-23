import { Icon } from "@/components/ui/Icon";
import { fileLabel, formatSize, type Attachment } from "./attachments";

/** Public display: photos as a small grid, documents as download rows. */
export function AttachmentList({ items }: { items?: Attachment[] }) {
  if (!items?.length) return null;
  const photos = items.filter((a) => a.kind === "image");
  const files = items.filter((a) => a.kind !== "image");
  return (
    <div className="attachments">
      {photos.length > 0 && (
        <ul className="attachments__photos reset-list">
          {photos.map((a) => (
            <li key={a.url}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={`Open photo ${a.name}`}>
                <img src={a.thumbUrl || a.url} alt={a.name.replace(/\.[^.]+$/, "")} loading="lazy" decoding="async" width={300} height={225} />
              </a>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="attachments__files reset-list" aria-label="Attached files">
          {files.map((a) => (
            <li key={a.url}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" download={a.name}>
                <span className={`attachments__badge attachments__badge--${a.kind}`}>{fileLabel(a)}</span>
                <span className="attachments__name">{a.name}</span>
                {a.size ? <span className="attachments__size">{formatSize(a.size)}</span> : null}
                <Icon name="download" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
