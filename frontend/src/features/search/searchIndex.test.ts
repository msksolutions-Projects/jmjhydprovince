import { describe, expect, it } from "vitest";
import { groupHits, search, searchIndex } from "./searchIndex";

describe("search index", () => {
  it("indexes pages, institutions and convents", () => {
    const groups = new Set(searchIndex.map((record) => record.group));
    expect(groups.has("Institutions")).toBe(true);
    expect(groups.has("Convent directory")).toBe(true);
    expect(searchIndex.length).toBeGreaterThan(50);
  });

  it("ignores queries shorter than two characters", () => {
    expect(search("a")).toHaveLength(0);
    expect(search(" ")).toHaveLength(0);
  });

  it("finds an institution by name", () => {
    const hits = search("Achampet");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((hit) => hit.title.includes("Achampet"))).toBe(true);
  });

  it("ranks title matches above body matches", () => {
    const hits = search("formation");
    expect(hits[0]?.score).toBeLessThanOrEqual(hits[hits.length - 1]?.score ?? 0);
  });

  it("groups hits and drops empty groups", () => {
    const groups = groupHits(search("school"));
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
  });

  it("returns nothing for a term that does not appear", () => {
    expect(search("zzzzzznotpresent")).toHaveLength(0);
  });
});
