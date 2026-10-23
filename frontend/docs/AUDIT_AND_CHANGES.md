> **Historical note:** this describes an earlier version (Material UI). The current design is documented in `REDESIGN_2026-10.md`, `ADMIN_REDESIGN.md` and the root `LAUNCH_CHECKLIST.md`.

# Audit and Enhancement Report

## 1. Baseline audit

The project was inspected before any code was changed. Findings, worst first.

### Blockers — the project did not build

| # | Issue | Detail |
|---|---|---|
| 1 | **`npm run build` failed** | `tsconfig.node.json` set `allowImportingTsExtensions` without `noEmit` or `emitDeclarationOnly`, so `tsc -b` aborted with TS5096 before Vite ever ran. |
| 2 | **Compiled artefacts committed** | `vite.config.js` and `vite.config.d.ts` — emitted output from a previous broken `tsc -b` — were sitting in the repository root alongside the real `vite.config.ts`, together with two stale `.tsbuildinfo` files. |
| 3 | **`npm run lint` failed** | 6 errors: two unused `Box` imports, an unnecessary regex escape, plus the linter choking on the leaked `vite.config.js` / `.d.ts`. |

### Gaps against the specification

| Area | Finding |
|---|---|
| Dependencies | TanStack Query, React Helmet Async, date-fns, `@hookform/resolvers`, Vitest and React Testing Library were all absent |
| SEO | No per-page metadata of any kind — a single static `<title>` in `index.html` for the whole site |
| Contact | No contact form existed; `/contact` rendered the convent directory |
| Institutions | No detail pages; filters held in local state, so results were not shareable and the back button did nothing |
| Search | Inline in the header, ungrouped, no keyboard shortcut, no empty state |
| Theme | A single file; no serif heading face; no split into palette / typography / overrides |
| Accessibility | No skip link component, no back-to-top, no focus management on navigation |
| Testing | No test framework at all |
| IA | "Our Presence" and "News and Updates" routes missing |

### Accessibility defect found by the new tests

The global search input carried `aria-label` on the MUI `TextField` root, which forwards unknown props to the wrapping `FormControl` **div** rather than the `<input>`. The search field therefore had **no accessible name** in the shipped build, and screen-reader users could not identify it. Caught only because a test tried to type into it and failed. Fixed by moving the label into `slotProps.htmlInput`.

---

## 2. Architectural improvements

1. **Build restored** — corrected `tsconfig.node.json`, deleted the leaked artefacts, and added them to `.gitignore` so they cannot return.
2. **Theme split into four modules** — `palette.ts` (the six approved colours plus reserved state colours), `typography.ts`, `componentOverrides.ts`, `theme.ts`. No component holds a hex value.
3. **Provider composition extracted** — `app/providers.tsx` composes Helmet, Query, Theme, CssBaseline and the error boundary in one place.
4. **Feature-first structure** — `features/{contact,gallery,institutions,publications,search}`, each owning its own service, hook and components. Page files no longer hold business logic.
5. **Service layer for every data source** — `contact.service.ts`, `gallery.service.ts`, `publications.service.ts`. Swapping mock for API is an env change.
6. **Content verification register** — `src/content/content-verification.ts` records ten unresolved source conflicts and governs what may be displayed.
7. **URL as filter state** — institution filters serialise to the query string, so a filtered view is shareable and back-button correct.
8. **Local search index** — built once at module load across sections, institutions and the convent directory; ranked, grouped, no external service.

---

## 3. Redesigned and new pages

| Page | Change |
|---|---|
| Content pages (16 routes) | Now use `ReadingLayout` — 780px measure, sticky desktop table of contents with scroll-spy, accordion section nav on mobile |
| Institution Directory | Rewritten: five filters, three sort keys, URL sync, sticky sortable table on desktop, cards on mobile, empty state, reset |
| Institution Detail | **New.** Renders the narrative where one exists; states "Detailed profile coming soon" where only master-table data exists, rather than inventing content |
| Contact | **New.** Contact form, office details, map, directory link |
| Convent Directory | Moved to `/contact/convents` |
| Gallery | Rewritten: TanStack Query, skeleton, error and empty states, 48-per-page incremental loading, arrow-key viewer navigation, per-image broken-image fallback, uniform grid replacing masonry |
| Publications | Rewritten: query-backed, skeleton, empty and error states, separate view and download actions |
| News and Updates | **New route** at `/news` |
| Our Presence | **New route** under Who We Are |

---

## 4. Reusable components added

`SkipLink` · `BackToTopButton` · `BreadcrumbNavigation` · `ReadingLayout` · `EmptyState` · `ErrorState` · `LoadingSkeleton` · `Seo` · `GlobalSearchDialog` · `ContactForm` · rewritten `PageHeader` and `SiteHeader`.

Every one has typed props, and each async view carries loading, empty and error branches.

---

## 5. Testing

45 tests across 8 files, all passing.

| Suite | Covers |
|---|---|
| `searchIndex` | Index composition, minimum query length, ranking, grouping, no-match |
| `useInstitutions` | 32 records present, facet construction, multi-year parsing (`GNM 1981 · B.Sc. 2001 · M.Sc. 2008` → 1981) |
| `contact.service` | Schema validation, consent requirement, optional phone, mock success and failure |
| `content-verification` | Register integrity, unique ids, and that no disputed exact date is publishable |
| `GlobalSearchDialog` | Prompt, grouped results, empty state, live-region announcement, close on select |
| `SiteHeader` | Nav landmark, `aria-expanded` state, submenu opening, search dialog, mobile drawer |
| `InstitutionsPage` | Default count, filtering, empty state, reset affordance, reading filters from the URL |
| `ContactForm` | Required-field errors, invalid email, consent, success with reference, failure preserving input |

---

## 6. Verification

```
npm run typecheck   ✓ clean
npm run lint        ✓ 0 errors, 0 warnings
npm run test        ✓ 45 passed
npm run build       ✓ success
```

Route-level code splitting is in effect; the largest page chunk is 8 kB gzipped, with MUI and React in stable vendor chunks.

---

## 7. Known limitations

- **Content gaps are inherited, not introduced.** The supplied content does not include narratives for every institution. Those detail pages say so plainly rather than inventing text.
- **The ten verification conflicts remain unresolved** and will stay withheld until the provincial office confirms them.
- **The contact endpoint is mocked.** The schema is written and shared; only the Express route is missing.
- **axe-core was not run** in this environment. The accessibility work above was implemented and unit-tested, but an automated audit and a manual screen-reader pass should be run before launch.
