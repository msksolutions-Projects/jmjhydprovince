import extractedProfiles from "@/data/institutionProfilesExtracted.json";

export type OfficialProfile = {
  status: string;
  sourceUrl: string | null;
  markdown: string;
  imageUrls: string[];
};

export const officialProfiles = extractedProfiles.profiles as Record<string, OfficialProfile>;

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The extracted pages open with the old site's breadcrumb line and one or two
 * repeated title headings. The page banner already shows the name, so drop the
 * breadcrumb, keep at most one distinct leading heading, and shift heading
 * levels so the profile starts at <h2>.
 */
export function tidyProfile(markdown: string): string {
  const lines = markdown.split("\n");
  let i = 0;
  const leading: string[] = [];
  while (i < lines.length) {
    const line = lines[i]!.trim();
    if (!line || /^institutions\b/i.test(line)) {
      i += 1;
      continue;
    }
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (!heading) break;
    leading.push(heading[1]!.trim());
    i += 1;
  }
  const rest = lines.slice(i).join("\n");
  const last = leading[leading.length - 1];
  const keep = leading.length > 1 && last && normalise(last) !== normalise(leading[0]!) ? `### ${last}\n\n` : "";
  const body = keep + rest;
  const depths = [...body.matchAll(/^(#{1,6})\s/gm)].map((m) => m[1]!.length);
  const shift = depths.length ? Math.min(...depths) - 2 : 0;
  return shift > 0 ? body.replace(/^(#{1,6})(\s)/gm, (_, h: string, sp: string) => `${"#".repeat(Math.max(2, h.length - shift))}${sp}`) : body;
}

