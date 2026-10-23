# Deploying the JMJ Hyderabad Province website

Two ways to get the site live:

## A. Upload the ready build (no Node.js needed)
1. Unzip `JMJ_Website_Build_ready_to_upload.zip`.
2. Upload **everything inside it** (including the hidden `.htaccess`) to your web root, e.g. `public_html/`.
3. Open the site. Admin is at `/admin/login`.

Works on Apache/cPanel (`.htaccess`), Netlify/Cloudflare Pages (`_redirects`, `_headers`) and Vercel (`vercel.json` in the source).

## B. Build from source
```bash
cd frontend
npm ci
npm run build      # output in dist/
npm run preview    # check it locally at http://localhost:4173
```

## Backend (news, notices, gallery, contact messages, admin)
The simplest setup is one server: `npm run setup && npm run build && npm start` in the project root —
the API then serves this website too (see the root `README.md`).

If the website is hosted separately (Vercel/Netlify/cPanel), set the API address in `frontend/.env`
before building:
```
VITE_API_BASE_URL=https://your-api-domain/api/v1
```
and add the website address to `FRONTEND_URL_PROD` (or `CORS_ORIGINS`) in `backend/.env`.
