# Website redesign — October 2026

Redesigned to follow the structure of the Congregation website (congregationjmj.org),
keeping the Province's blue-and-white identity, all content, photographs, documents and URLs.

## Navigation
- **Header**: contact top bar → logo/title bar → sticky navy menu with dropdowns
  (Home · About Us · Province · Mission · Community · Institutions · Media · Contact).
- **Mobile**: compact sticky header with a slide-in menu; the current section opens automatically.
- **Every inner page** now has breadcrumbs, a section sidebar (desktop) or section tabs (mobile),
  Previous / Next links within the section, and an "Explore more" block linking to every other section.
- **Institutions** can be filtered by Education / Health Care / Social, Pastoral & Formation
  (`/institutions?group=…`); each institution page links to the previous / next institution.
- Site search (Ctrl + K) now opens instantly and suggests common searches.
- All previous URLs are unchanged. The site map lives in `src/data/navigation.ts`.

## Home page (same order as the Congregation site)
Hero slider → quick links → welcome → Founder & Charism → quotation → six apostolates →
milestones → latest news + News Strings → presence & sister provinces → photo albums → contact band.

## Speed
- Public pages no longer use Material UI / Emotion; styling is one plain CSS file (`src/styles/global.css`, ~9 KB gzipped).
  MUI is still used by the staff (`/admin`) pages and is loaded only there.
- First-load JavaScript: **~100 KB gzipped (was ~250 KB)**.
- `react-markdown` replaced by `marked`; `axios` removed from public pages; unused `date-fns`
  and `@mui/icons-material` removed (icons are inline SVG: `src/components/ui/Icon.tsx`).
- Hero/banner photos have new 1000px `-md.webp` versions (35–105 KB instead of 84–272 KB) and use `srcset`,
  so phones download the 500px thumbnails. Logo shown at 7 KB instead of 41 KB.
- Home page no longer downloads the full 223 KB gallery index.

## Checks
- `npm run build` ✔ · `npm run test` 59/59 ✔ · `npm run typecheck` ✔ · `python tools/verify_media.py` ✔
- No horizontal scrolling at 360, 768, 1024 and 1366 px on any page.
- `npm run lint`: only the pre-existing findings in admin pages and `tools/` remain.

## Merged: "Institutions — No Placeholders" update (21 Oct 2026, 20:00)
- Institution list and detail pages show **no photographs or placeholder graphics**.
- Each institution page shows its profile extracted from the old Province website
  (`src/data/institutionProfilesExtracted.json`, 29 of 32 records), with the historical-figures note and a
  link to the original page. The old site's breadcrumb line and repeated title headings are tidied away
  (`src/features/institutions/officialProfiles.ts`). On phones the details card appears above the profile.
- Records without a usable source page (8, 16, 28, 32) show the "profile not yet available" note.
- Included unchanged: `INSTITUTIONS_SOURCE_AUDIT.md`, `tools/extract_institution_profiles.py` and the new tests.
