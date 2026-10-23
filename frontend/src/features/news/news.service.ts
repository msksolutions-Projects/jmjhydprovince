import type { Attachment } from "@/features/attachments/attachments";
import { API_BASE_URL as BASE_URL } from "@/lib/api";

export interface PublicNews {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  attachments?: Attachment[];
  publishedAt?: string;
  createdAt: string;
}

/** Small fetch wrapper with a timeout, so the public site does not ship axios. */
export async function apiGet<T>(path: string, params: Record<string, string | number>, signal?: AbortSignal): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const timeout = AbortSignal.timeout ? AbortSignal.timeout(45000) : undefined;
  const combined = signal && timeout && "any" in AbortSignal ? AbortSignal.any([signal, timeout]) : (signal ?? timeout);
  const response = await fetch(url, { signal: combined, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (await response.json()) as T;
}

export async function fetchPublishedNews(signal?: AbortSignal): Promise<PublicNews[]> {
  const data = await apiGet<{ data?: PublicNews[] }>("/news", { status: "published", limit: 50 }, signal);
  return data.data ?? [];
}

export async function fetchNewsBySlug(slug: string): Promise<PublicNews | null> {
  const list = await fetchPublishedNews();
  return list.find((n) => n.slug === slug) ?? null;
}

export const newsDate = (item: { publishedAt?: string; createdAt: string }) =>
  new Date(item.publishedAt || item.createdAt);
