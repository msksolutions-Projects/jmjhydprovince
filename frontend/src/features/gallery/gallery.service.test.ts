import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGallery, UPLOADS_ID } from "./gallery.service";

afterEach(() => vi.unstubAllGlobals());

const staticGallery = {
  categories: [{ id: "novices", label: "Novices", count: 0 }],
  images: [{ id: "n1", title: "N", alt: "Novices", category: "novices", categoryLabel: "Novices", src: "/n.webp", thumbnail: "/n-t.webp", width: 1, height: 1 }],
};

describe("fetchGallery", () => {
  it("puts photos uploaded in the admin first, as a 'Latest uploads' album", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("/gallery?")
          ? { data: [{ _id: "a1", title: "Feast day", coverImage: { url: "http://api/uploads/a.webp", thumbUrl: "http://api/uploads/a-thumb.webp" } }] }
          : staticGallery,
    })));
    const data = await fetchGallery();
    expect(data.categories[0]).toEqual({ id: UPLOADS_ID, label: "Latest uploads", count: 1 });
    expect(data.images[0]).toMatchObject({ id: "upload-a1", thumbnail: "http://api/uploads/a-thumb.webp", category: UPLOADS_ID });
    expect(data.images).toHaveLength(2);
  });

  it("adds uploads to an existing album or creates a new album filter", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("/gallery?")
          ? {
              data: [
                { _id: "a1", title: "Into Novices", album: "novices", coverImage: { url: "/a.webp" } },
                { _id: "a2", title: "New album photo", album: "Feast Day 2026", coverImage: { url: "/b.webp" } },
              ],
            }
          : staticGallery,
    })));
    const data = await fetchGallery();
    expect(data.categories.find((c) => c.id === "novices")?.count).toBe(2);
    expect(data.categories.find((c) => c.id === "album-feast-day-2026")).toMatchObject({ label: "Feast Day 2026", count: 1 });
    expect(data.categories[0]).toMatchObject({ id: UPLOADS_ID, count: 2 });
    expect(data.images.find((i) => i.id === "upload-a1")).toMatchObject({ category: "novices", categoryLabel: "Novices", isUpload: true });
  });

  it("still shows the Province collections when the API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("/gallery?")) throw new TypeError("Failed to fetch");
      return { ok: true, json: async () => staticGallery };
    }));
    const data = await fetchGallery();
    expect(data.images).toHaveLength(1);
    expect(data.categories.map((c) => c.id)).toEqual(["novices"]);
  });
});
