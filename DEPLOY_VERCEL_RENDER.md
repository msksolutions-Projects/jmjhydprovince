# Deploy: website on Vercel, API on Render

Order matters: GitHub → Cloudinary → MongoDB Atlas → Render (API) → Vercel (website) → back to Render for CORS → create admin.

## 1. Put the project on GitHub (private repository)
```bash
cd JMJ1
git add -A && git commit -m "Ready to deploy"      # skip if nothing changed
git remote add origin https://github.com/<you>/jmj-hyderabad.git
git branch -M main
git push -u origin main
```
`.env` files are git-ignored, so passwords are not uploaded.

## 2. Cloudinary (required on Render)
Render's free disk is wiped on every deploy/restart, so photos and attachments must go to Cloudinary.
cloudinary.com → sign up → Dashboard → copy **Cloud name**, **API Key**, **API Secret**.

## 3. MongoDB Atlas
Atlas → Network Access → Add IP Address → **Allow access from anywhere (0.0.0.0/0)** (Render has no fixed IP on the free plan).
Copy your connection string (Database → Connect → Drivers), e.g.
`mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/jmj_hyderabad?retryWrites=true&w=majority`

## 4. Render — the API
render.com → New → **Blueprint** → choose the repo (uses `render.yaml`), or New → Web Service with:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |

Environment variables:

| Key | Value |
|---|---|
| NODE_ENV | `production` |
| NODE_VERSION | `22` |
| MONGODB_URI | your Atlas string |
| JWT_SECRET | long random text (Blueprint generates it) |
| JWT_EXPIRES_IN | `24h` |
| CLOUDINARY_NAME / CLOUDINARY_KEY / CLOUDINARY_SECRET | from step 2 |
| FRONTEND_URL | fill in after step 5, e.g. `https://jmj-hyderabad.vercel.app` |
| CORS_ORIGINS | optional extra sites, comma separated, e.g. `https://jmjhyderabadprovince.org,https://www.jmjhyderabadprovince.org` |
| SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / CONTACT_TO | optional e-mail alerts for contact messages |

Check: `https://<your-service>.onrender.com/api/v1/health` shows `"database":"connected"` and `"imageStorage":"cloudinary"`.

## 5. Vercel — the website
vercel.com → Add New → Project → import the repo.

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variables (Vite bakes them in at build time — redeploy after changing them):

| Key | Value |
|---|---|
| VITE_API_BASE_URL | `https://<your-service>.onrender.com/api/v1` |
| VITE_SITE_URL | `https://<project>.vercel.app` (or your own domain) |
| VITE_WHATSAPP_NUMBER / VITE_GA_ID | optional |

`frontend/vercel.json` already handles page refreshes on deep links (e.g. /institutions/...).

## 6. Connect them
Render → your service → Environment → set `FRONTEND_URL` to the exact Vercel address (https, no trailing slash) → Save (it redeploys).

## 7. Create the admin account straight away
Open `https://<project>.vercel.app/admin/login` → Create an admin account. Only the first account can register, so do this immediately after going live.

## 8. Check
News, Notices, Gallery load · contact form gives a JMJ-… reference · the message appears in Admin → Messages · upload a photo and a PDF and see them on the public pages.

## Free plan notes
- Render free services sleep after 15 minutes idle; the first request then takes up to about a minute. The site waits up to 45–60 s instead of failing. To avoid the wait: Render Starter plan, or a free monitor (e.g. UptimeRobot) calling `/api/v1/health` every 10 minutes.
- Render may block outgoing e-mail (SMTP) on free services; contact messages are always saved in the admin inbox regardless.

## Own domain (optional)
Vercel → Project → Settings → Domains → add `jmjhyderabadprovince.org` and follow the DNS records shown. Then update `VITE_SITE_URL` (redeploy) and add the domain to Render's `FRONTEND_URL`/`CORS_ORIGINS`.
