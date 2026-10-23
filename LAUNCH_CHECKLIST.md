# Launch checklist — 22 October 2026

Tested with the real backend and a real browser (Chromium) against a fresh database.

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Mobile tested | ✅ GO | Every page checked at 390 px and 1366 px (124 page views): no sideways scrolling; menus, filters, lightbox, forms and admin all work on phones. |
| 2 | All links | ✅ GO | Crawled 62 pages: no broken internal links, no 404s, all 15 linked PDFs open. External sites (sister provinces, Google Maps) could not be checked from the test machine. |
| 3 | Contact form | ✅ GO | Saves to the database, shows a reference number, appears in **Admin → Messages** (read / replied / archive / delete / reply by email). Validation on both sides, spam honeypot, 5 messages per 10 min per visitor. Email copies need `SMTP_*` in `backend/.env`. |
| 4 | Loads < 3 s | ✅ GO | Home page on a throttled phone (4 Mbps, 150 ms latency, 4× slower CPU): largest content painted at 0.7 s, fully loaded 1.1 s, 386 KB. |
| 5 | Images | ✅ GO | All images have alt text, none broken, lazy-loaded below the fold, WebP with phone-sized versions. |
| 6 | HTTPS | ⚠️ ON DEPLOY | Comes from the host (Render/Vercel/Netlify give it free; cPanel: enable AutoSSL). The site then forces HTTPS (`.htaccess`) and the API sends HSTS in production. |
| 7 | Chrome + Safari | ✅ Chrome / ⚠️ Safari | Fully tested in Chromium (Chrome/Edge). Safari could not be run here; code avoids Safari-incompatible features (prefixes added). Please open it once on an iPhone. |
| 8 | No typos | ✅ GO | Spell-checked all pages and data. Fixed: Postulency → Postulancy, Telangna → Telangana, indentifying, equipments. |
| 9 | WhatsApp button | ⚠️ NEEDS NUMBER | Built in. Add `VITE_WHATSAPP_NUMBER=91XXXXXXXXXX` to `frontend/.env` and rebuild — it appears bottom-left on every page. |
| 10 | Domain email | ⚠️ YOUR DNS | Currently jmjhyd@gmail.com. A domain address (office@yourdomain) is set up at your domain provider (Google Workspace / Zoho Mail free). |
| 11 | Analytics | ⚠️ NEEDS ID | Built in (Google Analytics 4, admin pages not tracked). Add `VITE_GA_ID=G-XXXXXXX` to `frontend/.env` and rebuild. |
| 12 | Google index | ✅ READY | `sitemap.xml` (58 pages) and `robots.txt` generated on every build for `VITE_SITE_URL`; admin and API excluded; canonical URLs. After launch, submit the sitemap in Google Search Console. |
| 13 | Link preview | ✅ GO | Share image (1200×630) and title/description tags in the page itself, so WhatsApp, Facebook and LinkedIn show a proper card. |
| 14 | Backups | ✅ GO | `npm run backup` saves every collection to `backend/backups/<date>/`. Run it weekly (or on a schedule). |
| 15 | Payments | ➖ N/A | The site has no donations or payments. |

## Fixed in this round

**Backend**
- Duplicate news/photo titles crashed with a database error → unique web addresses are created automatically.
- Validation problems returned "server error 500" → clear 400 messages ("Title must be at least 5 characters").
- Visitors could read **draft** articles, notices and photos through the API → only published items are public.
- Any field (author, view count…) could be overwritten through edits → only editable fields are accepted.
- Invalid IDs and wrong file types crashed with technical errors → "Not found" / "Only image files are allowed".
- Gallery uploads failed without Cloudinary → saved locally automatically; Cloudinary used when configured.
- The contact form had no backend → new `/api/v1/contact` endpoint + admin inbox + optional email.
- Notice attachments field was defined incorrectly (Mongoose `type` clash) → fixed.
- CORS blocked the local preview; login emails were case-sensitive; `/api/health` missing → fixed.
- JWT secret was the example value (logins could be forged) → strong random secret set; production refuses to start without one.
- Security: strict login rate limit, HTTPS/HSTS and content-security headers, trust-proxy for Render, NoSQL-injection sanitising kept.
- The API now also serves the built website, so one `npm start` runs everything.
- Security updates: backend packages now report **0 known vulnerabilities** (Express, Cloudinary 2, Nodemailer, axios removed).
  Frontend: axios updated; one *moderate* React Router advisory remains that only affects apps passing
  visitor-typed addresses to navigation or using server rendering — neither applies here. It clears with
  the React Router 7 upgrade, which can be done later.

**Frontend**
- Admin, News, Notices and Contact pointed at `localhost:5000` → one shared API address with a built-in development proxy.
- Contact form was a demo → sends to the real API, scrolls the confirmation into view.
- Old `AdminShell.tsx` / `theme/` files (Material UI, removed) would have broken the build → removed.
- Editors now enforce the same rules as the database (title ≥ 5, article ≥ 100, notice ≥ 50 characters…), all categories match.
- New admin pages: **Messages** (with unread badge) and **Account** (change password).

## Round 2 — 22 October 2026

1. **Contact messages not showing in admin — fixed.**
   - The inbox only loaded once, so messages sent while it was open never appeared. The inbox, the
     unread badge and the dashboard now refresh by themselves (every 20–60 s and whenever you return to the tab),
     with a "new message arrived" notice.
   - Messages could be silently discarded: if browser autofill or a password manager filled the hidden
     anti-spam field, the visitor saw "Message sent" but nothing was saved. Every message is now saved;
     suspected spam goes to a **Spam** tab with a "Not spam" button.
   - Demo (mock) mode can no longer be switched on in a real build.
2. **Gallery not updated / album filters — fixed.**
   - Photos uploaded in the admin now appear on the public Photo Gallery and on the home page.
   - New **Album** choice in Admin → Gallery: add a photo to an existing album (its filter count goes up)
     or create a new album (a new filter appears). Every upload is also listed under "Latest uploads".
   - Album filter names cleaned up (Postulancy, Lay Collaboration · Jul 2026, Assessment Teams · Feb 2025…);
     links unchanged.
   - Uploads are optimised automatically: correct rotation for phone photos, max 1600 px WebP + a thumbnail
     (a 5–10 MB phone photo becomes ~200 KB).
3. **Fonts** — Playfair Display (headings) and Inter (text, admin), both Google Fonts, now self-hosted:
   no request to Google, faster first paint, works offline/behind firewalls.
4. **All devices** — tested on 13 screen sizes from 320 px (iPhone SE) to 1920 px, including tablets and a
   landscape phone. Fixed: overflow of the "Load more" button and convent badges at 320 px, header text below
   11 px on phones.
5. **Animations** — sections and cards fade up as they scroll into view (staggered), hero text animates
   per slide, pages fade in, statistics count up, admin cards ease in. Only opacity/transform are animated (smooth
   on low-end phones) and everything is turned off for visitors who choose "reduce motion".

## Round 3 — home carousel and attachments

- [x] Home page carousel replaced with the 10 Province photographs, photos only (no text over them). Each photo is served in 3 sizes (600/1000/1600 px WebP) and only the current and next photos load. To change the photos, replace the files in `frontend/public/media/home-carousel/` and the list in `frontend/src/features/home/slides.ts`.
- [x] News and Notices can carry up to 10 attachments each (PDF, Word, Excel, PowerPoint, TXT or photos; up to 15 MB each). Upload them in the admin editor; they show on the public News and Notices pages as photo thumbnails and download rows.
- [x] Files removed in the editor, or uploaded and then cancelled, are deleted from storage; deleting an article or notice deletes its files.
- [x] With Cloudinary configured, documents are stored there (folder `jmj-attachments`); otherwise in `backend/uploads/` — back that folder up.
- [x] Tests: backend 10/10, frontend 72/72, E2E public 23 checks + 124 pages, admin 44 checks, 13 devices 0 problems.
