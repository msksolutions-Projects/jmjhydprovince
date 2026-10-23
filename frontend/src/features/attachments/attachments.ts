export interface Attachment {
  name: string;
  url: string;
  thumbUrl?: string;
  type?: string;
  kind: "image" | "pdf" | "document";
  size?: number;
  publicId?: string;
  resourceType?: string;
  uploadedAt?: string;
}

export const MAX_ATTACHMENTS = 10;
export const MAX_FILE_MB = 15;
export const ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.gif,application/pdf,image/jpeg,image/png,image/webp,image/gif";

export function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Short label for a file type, e.g. "PDF", "DOCX". */
export function fileLabel(a: Pick<Attachment, "name" | "kind">) {
  if (a.kind === "pdf") return "PDF";
  const ext = a.name.split(".").pop();
  return ext && ext.length <= 5 ? ext.toUpperCase() : "File";
}
