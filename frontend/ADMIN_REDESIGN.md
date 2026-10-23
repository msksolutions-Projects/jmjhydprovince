# Admin dashboard redesign — October 2026

The staff area (`/admin`) is now its own app with its own layout: no public header or footer.

## Screens
- **Login / Register**: split screen with a Province photo, show/hide password, password-strength meter,
  clear server errors, and a return to the page you were trying to open after signing in.
- **Layout**: navy sidebar (Dashboard · News · Notices · Gallery · View website · Log out), sticky top bar with
  breadcrumb and an account menu. On phones the sidebar slides in from a menu button.
- **Dashboard**: greeting, four live counters (news, notices, photos, drafts waiting), recent activity across all
  content, quick actions and a content-mix bar.
- **News / Notices / Gallery**: status tabs with counts (All · Published · Drafts), search, category filter,
  a table on desktop and cards on phones, a slide-in editor with character counters, Draft/Published switch,
  notice urgency picker, drag-and-drop photo upload with preview and size check, a styled delete confirmation
  instead of the browser pop-up, and success/error toasts.

## Unchanged
API endpoints, request bodies, the `admin_token` login storage and `src/admin/adminApi.ts` / `authService.ts`.

## Technical
- Material UI and Emotion are removed from the project; admin styles are `src/admin/admin.css`
  (loaded only on admin pages).
- The session is checked once for the whole admin area (`AdminAuth.tsx`) instead of on every page.
- Dashboard links such as `/admin/news?new=1` open the editor directly; `?status=draft` filters drafts.
- New tests: `src/admin/admin.test.tsx` (7). Totals: 66 tests passing; `npm run lint` is now clean.
