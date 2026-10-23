import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { safeguardingDocuments } from "./safeguardingDocuments";

describe("client-supplied safeguarding PDFs", () => {
  it("publishes the approved policy and all four annexures", () => {
    expect(safeguardingDocuments).toHaveLength(5);
    for (const document of safeguardingDocuments) {
      expect(document.file.endsWith(".pdf")).toBe(true);
      const publicPath = resolve(process.cwd(), "public", document.file.slice(1));
      expect(statSync(publicPath).size).toBe(document.bytes);
    }
  });
});
