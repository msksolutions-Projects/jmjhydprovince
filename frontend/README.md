# JMJ Hyderabad Province — Frontend

Congregation of Jesus Mary Joseph, Hyderabad Province.

Vite · React 18 · TypeScript (strict) · plain CSS (no UI framework) · TanStack Query · React Hook Form + Zod · Vitest

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

> **Start with the root `README.md`** (one folder up): it runs the website and the backend API together.
>
> The contact form, news, notices, gallery uploads and admin all use the real API at `/api/v1`. During `npm run dev`, requests to `/api` and `/uploads` are forwarded to `VITE_API_PROXY` (default `http://localhost:5000`), so start the backend too (`npm run dev:api` in the root).

### Client photo refresh (21 October 2026)

The public photo gallery now contains **484 approved photographs** arranged into **12 folder-based filters**. Files are self-hosted as optimized WebP images and thumbnails. Homepage images, relevant ministry photos and institution placeholders have also been updated. See [MEDIA_UPDATE_REPORT.md](MEDIA_UPDATE_REPORT.md) for the source folder counts, editorial choices and limitations.

Before publishing, verify the complete image inventory with:

```bash
python tools/verify_media.py
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b`, no emit |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run test` | Vitest suite |
| `npm run test:coverage` | Coverage report |
| `npm run check` | typecheck + lint + test |

---

## Project structure

```
src/
├── app/               App shell, router, providers, query client
├── admin/             Admin dashboard (login, news, notices, gallery, messages, account) + admin.css
├── styles/            global.css — the whole public design (colours, fonts, layout, animations)
├── components/
│   ├── common/        PageHeader, PageShell (section menu + prev/next), ContentMarkdown, scroll animations, WhatsApp, Analytics
│   ├── feedback/      EmptyState, ErrorState, LoadingSkeleton
│   ├── layout/        AppLayout, SiteHeader, SiteFooter
│   ├── ui/            Icon (inline SVG icon set)
│   └── seo/           Seo component + JSON-LD schema builders
├── features/
│   ├── contact/       ContactForm + contact.service
│   ├── gallery/       gallery.service (approved albums + admin uploads)
│   ├── institutions/  useInstitutions (URL-synced filters)
│   ├── publications/  publications.service
│   └── search/        searchIndex, GlobalSearchDialog, useSearchShortcut
├── content/           content-verification register
├── data/              content.json, institutions.json, directory.json, navigation, site
├── pages/             Route components
├── services/          Content access layer
├── test/              Vitest setup and render helpers
└── types/             Shared domain types
```

Dependencies point downward only. `components/` never imports from `features/`; anything a shared component needs arrives as a prop.

---

## Content policy

`src/content/content-verification.ts` is the register of unresolved factual conflicts in the source material. Ten conflicts are recorded, including the missionary arrival date given as both **24 February 1904** and **28 February 1904**.

Nothing in that register is published as settled fact. Each entry carries a `publicValue`:

- a **safe value** the site may display — the arrival date shows as "February 1904"
- or **`null`**, meaning the fact is withheld entirely until the provincial office confirms it

A unit test asserts that no disputed exact date reaches the UI. Do not resolve a conflict by picking one source: update the register once the office confirms, and change `status` to `resolved`.

---

## Backend integration

The Express API is expected at `VITE_API_BASE_URL`.

| Endpoint | Method | Contract |
|---|---|---|
| `/contact` | POST | Body validated by `contactSchema` in `contact.service.ts`; returns `{ ok: true, reference: string }` |

Reuse `contactSchema` server-side so both ends validate the same shape. Axios carries a 15-second timeout and a response interceptor that converts HTTP failures into messages fit to show a visitor — no status codes or stack traces reach the UI.

Gallery and publications read static manifests from `/public/data/`. To move them behind the API, edit those two service modules only.

---

## Accessibility

Targets WCAG 2.2 AA.

- Skip link is the first tab stop; focus moves to `<main>` on every route change
- One global `:focus-visible` ring, never removed
- Menu triggers are buttons with `aria-expanded` / `aria-controls`; focus returns to the trigger on close
- Result counts announced through `role="status"` live regions
- Form errors wired with `aria-describedby`; the first invalid field takes focus on submit
- Gallery viewer supports arrow-key navigation and Escape
- 44px minimum interactive height on buttons and list rows
- `prefers-reduced-motion` honoured globally

---

## Deployment

```bash
npm run build        # emits dist/
```

`dist/` is a static bundle — deploy to any static host or CDN.

`public/_headers` and `public/_redirects` are included for Netlify-style hosts; `vercel.json` covers Vercel. Both route all paths to `index.html` for client-side routing.

Set `VITE_SITE_URL` to the production origin before building, or canonical URLs and Open Graph tags will point at localhost.

Security headers belong at the host, not in the bundle: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a Content-Security-Policy permitting `fonts.googleapis.com`, `fonts.gstatic.com` and the Google Maps embed used on the contact page.
