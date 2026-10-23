import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@/features/publications/publications.service";

export function DocumentCard({ title, file, bytes, description }: { title: string; file: string; bytes: number; description?: string }) {
  return (
    <article className="card">
      <div className="card__body">
        <div className="row row--between" style={{ marginBottom: 12 }}>
          <span className="card__icon" style={{ marginBottom: 0 }}>
            <Icon name="file" />
          </span>
          <span className="chip chip--outline">PDF · {formatBytes(bytes)}</span>
        </div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="card__foot">
        <a className="btn btn--sm" href={file} target="_blank" rel="noopener noreferrer" aria-label={`View ${title}`}>
          <Icon name="external" /> View
        </a>
        <a className="btn btn--sm btn--outline" href={file} download aria-label={`Download ${title}`}>
          <Icon name="download" /> Download
        </a>
      </div>
    </article>
  );
}
