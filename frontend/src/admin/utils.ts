import type { Attachment } from "@/features/attachments/attachments";

export function apiError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string; errors?: { msg?: string; message?: string }[] } };
    code?: string;
  };
  if (e?.code === "ERR_NETWORK") return "Cannot reach the server. Check that the API is running and try again.";
  const first = e?.response?.data?.errors?.[0];
  return e?.response?.data?.message || first?.msg || first?.message || fallback;
}

export const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export function initials(name?: string) {
  return (name ?? "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** 0–4 rough strength score: length, mixed case, digit, symbol. */
export function passwordScore(value: string) {
  if (!value) return 0;
  let score = value.length >= 8 ? 1 : 0;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.max(1, score);
}

export const timeOfDay = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  urgency: string;
  status: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  album?: string;
  description?: string;
  category: string;
  status: string;
  coverImage?: { url: string; thumbUrl?: string };
  createdAt: string;
}

/** First name without a title such as Sr., Fr. or Rev. */
export function firstName(name?: string) {
  const parts = (name ?? "").split(/\s+/).filter(Boolean);
  const rest = parts.filter((p, i) => !(i < parts.length - 1 && /^(sr|sister|fr|father|rev|br|brother|dr|mr|mrs|ms|mother)\.?$/i.test(p)));
  return rest[0] ?? "Administrator";
}

export interface ContactMessage {
  _id: string;
  reference: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived" | "spam";
  createdAt: string;
}
