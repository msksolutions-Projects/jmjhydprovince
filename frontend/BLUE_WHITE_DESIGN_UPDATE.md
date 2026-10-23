> **Historical note:** this describes an earlier version (Material UI). The current design is documented in `REDESIGN_2026-10.md`, `ADMIN_REDESIGN.md` and the root `LAUNCH_CHECKLIST.md`.

# JMJ Hyderabad Province — Blue & White Design Update

This is the **complete client-photo frontend project** with the same visual direction as the blue-and-white Congregation JMJ design concept.

## What changed

- Updated the shared Material UI palette, typography, component shapes, buttons and surfaces.
- Reworked the responsive header and top contact strip styling.
- Redesigned the homepage hero into the navy editorial panel and framed photographic panel with original carousel text, links and controls.
- Updated feature sections, ministry cards, page banners and footer to the same editorial visual language.
- Kept content, images, navigation destinations, forms, admin UI logic, gallery categories, filters, URLs and photo counts unchanged.

## What was intentionally not changed

- All 12 photo collections and **484 gallery photos** remain in place.
- Ministries, institutions, pages, documents and client content remain intact.
- No backend or live website has been modified.

## Run locally

1. Install Node.js 20 or 22.
2. Open the `frontend` folder in a terminal.
3. Run `npm ci` and then `npm run dev`.
4. Open the address shown by Vite, usually `http://localhost:5173/`.

## Validation

- `npm run build`: passed.
- `npm run test`: 54 tests passed.
- `python tools/verify_media.py`: verified 484 photos / 12 gallery filters / 968 optimized WebP files.
- `npm run check`: type checking passed, but lint reports 19 **pre-existing** findings in admin files, the existing router/notices, and developer tools. None are in the theme update files.

The package includes the source, public media and lockfile. `node_modules` and generated build caches are deliberately omitted; they can be reproduced with `npm ci` and `npm run build`.
