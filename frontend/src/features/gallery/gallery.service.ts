/** The 12 client-approved photo collections are the single public gallery source. */
export interface GalleryCategory {
  id: string;
  label: string;
  count: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  alt: string;
  category: string;
  categoryLabel: string;
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  /** Uploaded through the admin (shown under "Latest uploads"). */
  isUpload?: boolean;
}

export interface GalleryData {
  categories: GalleryCategory[];
  images: GalleryImage[];
}

import { API_BASE_URL } from "@/lib/api";

export const UPLOADS_ID = "latest-uploads";

interface ApiPhoto {
  _id: string;
  title: string;
  description?: string;
  album?: string;
  coverImage?: { url?: string; thumbUrl?: string; width?: number; height?: number };
  createdAt?: string;
}

const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "album";

/** Published photos uploaded through the admin. Never throws: the gallery still works if the API is down. */
async function fetchApiPhotos(signal?: AbortSignal, limit = 200): Promise<ApiPhoto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/gallery?limit=${limit}`, { signal, headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    const body = (await response.json()) as { data?: ApiPhoto[] };
    return Array.isArray(body?.data) ? body.data.filter((p) => p.coverImage?.url) : [];
  } catch {
    return [];
  }
}

/** Maps an uploaded photo onto an existing album id, a new album, or "Latest uploads". */
function toImage(p: ApiPhoto, albums: Map<string, string>): GalleryImage {
  const album = (p.album ?? "").trim();
  let category = UPLOADS_ID;
  let categoryLabel = "Latest uploads";
  if (album && albums.has(album)) {
    category = album;
    categoryLabel = albums.get(album)!;
  } else if (album) {
    category = `album-${slug(album)}`;
    categoryLabel = album;
  }
  return {
    id: `upload-${p._id}`,
    title: p.title,
    alt: p.description?.trim() || p.title,
    category,
    categoryLabel,
    src: p.coverImage!.url!,
    thumbnail: p.coverImage!.thumbUrl || p.coverImage!.url!,
    width: p.coverImage!.width ?? 1600,
    height: p.coverImage!.height ?? 1200,
    isUpload: true,
  };
}

/** Uploaded photos for the home page tile (no album information needed). */
export async function fetchUploadedPhotos(signal?: AbortSignal, limit = 200): Promise<GalleryImage[]> {
  return (await fetchApiPhotos(signal, limit)).map((p) => toImage(p, new Map()));
}

/** Albums of the approved collections, for the admin upload form. */
export async function fetchAlbumList(signal?: AbortSignal): Promise<GalleryCategory[]> {
  const response = await fetch("/data/gallery.json", { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as GalleryData;
  return Array.isArray(data.categories) ? data.categories : [];
}

export async function fetchGallery(signal?: AbortSignal): Promise<GalleryData> {
  const uploadsPromise = fetchApiPhotos(signal);
  const response = await fetch("/data/gallery.json", { signal });
  if (!response.ok) throw new Error("The photo gallery could not be loaded.");

  const data = (await response.json()) as GalleryData;
  if (!Array.isArray(data.images) || !Array.isArray(data.categories)) {
    throw new Error("The photo gallery data is incomplete.");
  }

  const albums = new Map(data.categories.map((c) => [c.id, c.label] as const));
  const uploads = (await uploadsPromise).map((p) => toImage(p, albums));
  // Newest admin uploads first, then the approved Province collections.
  const images = [...uploads, ...data.images];

  const counts = new Map<string, number>();
  for (const image of images) counts.set(image.category, (counts.get(image.category) ?? 0) + 1);

  // New albums created in the admin, in upload order.
  const newAlbums: GalleryCategory[] = [];
  for (const u of uploads) {
    if (u.category.startsWith("album-") && !newAlbums.some((a) => a.id === u.category)) {
      newAlbums.push({ id: u.category, label: u.categoryLabel, count: counts.get(u.category) ?? 0 });
    }
  }

  return {
    images,
    categories: [
      // "Latest uploads" lists every uploaded photo, whatever album it is in.
      ...(uploads.length ? [{ id: UPLOADS_ID, label: "Latest uploads", count: uploads.length }] : []),
      ...newAlbums,
      ...data.categories.map((category) => ({ ...category, count: counts.get(category.id) ?? 0 })),
    ],
  };
}
