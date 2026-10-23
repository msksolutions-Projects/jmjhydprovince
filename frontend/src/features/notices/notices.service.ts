import type { Attachment } from "@/features/attachments/attachments";
import { apiGet } from "@/features/news/news.service";

export interface PublicNotice {
  _id: string;
  title: string;
  content: string;
  category: string;
  urgency: string;
  attachments?: Attachment[];
  publishedAt?: string;
  createdAt: string;
  expiryDate?: string;
}

export async function fetchPublishedNotices(signal?: AbortSignal): Promise<PublicNotice[]> {
  const data = await apiGet<{ data?: PublicNotice[] }>("/notices", { status: "published", limit: 50 }, signal);
  return data.data ?? [];
}
