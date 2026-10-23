# JMJ Hyderabad Province — complete website

```
JMJ1/
├── frontend/   React website + admin dashboard (Vite)
└── backend/    Express + MongoDB API (news, notices, gallery, contact messages, admin login)
```

## Run it on your computer (Node.js 20.9+ or 22)

```bash
npm run setup        # installs backend and frontend packages (first time only)
npm run build        # builds the website into frontend/dist
npm start            # starts the API and serves the website
```

Open **http://localhost:5000** — the website, with the admin at **http://localhost:5000/admin**.
The first time, click **Create an admin account** on the login page (only works while no admin exists).

### While editing code
Run these in two terminals, then open http://localhost:5173 (changes appear instantly):
```bash
npm run dev:api
npm run dev:web
```

## Settings (`backend/.env`)

| Setting | What it does |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas database (already set). In Atlas → Network Access, allow your server's IP (or 0.0.0.0/0). |
| `JWT_SECRET` | Signs admin logins. A strong random value has been set — keep it private. |
| `CLOUDINARY_*` | Optional. When filled in, gallery uploads go to Cloudinary. When left as examples, photos are saved in `backend/uploads/`. **Use Cloudinary on Render/Railway/Heroku** — their disks are wiped on every deploy. |
| `SMTP_*`, `CONTACT_TO` | Optional. When filled in, every contact-form message is also emailed to `CONTACT_TO`. For Gmail use an App Password. Messages are always saved in **Admin → Messages**. |
| `FRONTEND_URL_PROD`, `CORS_ORIGINS` | Website addresses allowed to call the API when the website is hosted separately (e.g. Vercel). |

Frontend settings (`frontend/.env`): `VITE_SITE_URL` (your domain, for Google and link previews), `VITE_WHATSAPP_NUMBER` (shows the WhatsApp button), `VITE_GA_ID` (Google Analytics), `VITE_API_BASE_URL` (only if the API is on another domain).

## Deploying

**One server (simplest):** deploy the whole folder to Render/Railway/a VPS.
Build command `npm run setup && npm run build`, start command `npm start`, add the `backend/.env` values as environment variables (set `NODE_ENV=production`).

**Separate hosting:** website on Vercel/Netlify/cPanel (`frontend/dist`, see `frontend/DEPLOY.md`) with
`VITE_API_BASE_URL=https://<your-api>/api/v1`, and the API on Render with `FRONTEND_URL_PROD=https://<your-website>`.

## Useful commands

```bash
npm test                                   # all automated tests (frontend 69, backend 9*)
npm run backup                             # backs up the database to backend/backups/<date>/
npm --prefix backend run create-admin -- "Name" email@example.com "NewPassword123"   # reset a lost password / unlock
```
\* backend tests need a throwaway database: `MONGODB_URI_TEST=mongodb://localhost:27017/jmj_test npm --prefix backend test`

See `LAUNCH_CHECKLIST.md` for what was checked and what is left for go-live.
