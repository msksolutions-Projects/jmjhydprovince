import { describe, expect, it } from "vitest";
import institutions from "./institutions.json";
import extracted from "./institutionProfilesExtracted.json";

describe("official institution-page extraction", () => {
  it("accounts for every frontend directory record without inventing profiles", () => {
    expect(Object.keys(extracted.profiles)).toHaveLength(32);
    for (const institution of institutions) {
      const profile = extracted.profiles[institution.id as keyof typeof extracted.profiles];
      expect(profile).toBeDefined();
      if (profile.status === "extracted") {
        expect(profile.markdown.length).toBeGreaterThan(150);
        expect(profile.sourceUrl).toContain("jmjhyderabadprovince.org/");
      } else {
        expect(profile.markdown).toBe("");
      }
      expect(profile.markdown).not.toMatch(/1xbet|online casino|slot machine|porn/i);
    }
  });

  it("preserves all official menu pages including unmatched additional establishments", () => {
    expect(extracted.sourcePageCount).toBe(34);
    expect(extracted.extraSourcePages).toHaveLength(3);
    expect(extracted.profiles["1"].markdown).toContain("Our Vision");
    expect(extracted.profiles["2"].markdown).toContain("COMPUTER EDUCATION");
  });
});
