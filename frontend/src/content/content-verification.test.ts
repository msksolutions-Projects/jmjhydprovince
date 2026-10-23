import { describe, expect, it } from "vitest";
import { contentVerification, unresolvedCount, verificationFor } from "./content-verification";

describe("content verification register", () => {
  it("records the 1904 arrival-date conflict", () => {
    const item = verificationFor("arrival-date-1904");
    expect(item).toBeDefined();
    expect(item?.conflict).toMatch(/24 February 1904/);
    expect(item?.conflict).toMatch(/28 February 1904/);
  });

  it("never publishes a disputed exact date", () => {
    const item = verificationFor("arrival-date-1904");
    expect(item?.publicValue).toBe("February 1904");
    expect(item?.publicValue).not.toMatch(/\d{1,2} February/);
  });

  it("withholds every unresolved fact that has no safe value", () => {
    const withheld = contentVerification.filter((i) => i.publicValue === null);
    expect(withheld.length).toBeGreaterThan(0);
    for (const item of withheld) expect(item.status).toBe("unresolved");
  });

  it("gives every entry a unique id", () => {
    const ids = contentVerification.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("counts unresolved items", () => {
    expect(unresolvedCount).toBe(contentVerification.filter((i) => i.status === "unresolved").length);
  });
});
