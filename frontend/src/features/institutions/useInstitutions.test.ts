import { describe, expect, it } from "vitest";
import { earliestYear, facets, institutions } from "./useInstitutions";

describe("institutions data", () => {
  it("holds the full set of institutions", () => {
    expect(institutions).toHaveLength(32);
  });

  it("gives every institution an id and a name", () => {
    for (const item of institutions) {
      expect(item.id).toBeTruthy();
      expect(item.institution).toBeTruthy();
    }
  });

  it("builds facets that always start with All", () => {
    expect(facets.type[0]).toBe("All");
    expect(facets.medium[0]).toBe("All");
    expect(facets.intake[0]).toBe("All");
  });

  describe("earliestYear", () => {
    it("reads a single year", () => {
      expect(earliestYear("1990")).toBe(1990);
    });

    it("takes the earliest of several years", () => {
      expect(earliestYear("GNM 1981 · B.Sc. 2001 · M.Sc. 2008")).toBe(1981);
      expect(earliestYear("1989 · 2014")).toBe(1989);
    });

    it("sorts entries without a year to the end", () => {
      expect(earliestYear("—")).toBe(Number.POSITIVE_INFINITY);
    });
  });
});
