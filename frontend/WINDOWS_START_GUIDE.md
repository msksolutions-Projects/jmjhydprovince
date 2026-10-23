> **Updated:** to run the whole project (website + admin + API), follow the root `README.md`:
> `npm run setup`, `npm run build`, `npm start`, then open http://localhost:5000.
> The steps below run only the website in development mode (start the API too with `npm run dev:api` from the root folder).

# Starting the JMJ Hyderabad Province frontend on Windows

## First-time setup

Use **64-bit Node.js 20, 22, or 24** and open **Command Prompt** in this project's `frontend` folder.

```cmd
npm install
npm run doctor
npm run dev
```

Open `http://localhost:5173/` once the terminal says Vite is ready. **Keep the terminal open** while using the site.

## Fix for `Failed to fetch dynamically imported module: HomePage.tsx`

If the terminal also prints `FATAL ERROR: Zone Allocation failed - process out of memory`, the Vite development server has crashed. When it stops, the browser cannot download `HomePage.tsx`.

The updated `npm run dev` command explicitly gives the Node.js process a 2 GB maximum JavaScript heap; this is a maximum, not 2 GB allocated at startup. It may still fail if Windows does not have enough memory or virtual memory available.

1. Stop the old terminal process with `Ctrl + C` if it is still running.
2. Run `npm run doctor`. Confirm the architecture says `x64` or `arm64` and check free memory.
3. Close large memory-heavy applications if RAM is low.
4. Run `npm run dev` again.
5. Once Vite is running, refresh the browser with `Ctrl + Shift + R`.

If it still crashes, copy the full `npm run doctor` output and the new error message when requesting support. Do not share passwords or secret environment values.

## Production preview

To test the compiled site without Vite's development module transformations:

```cmd
npm run build
npm run preview
```

Open the address shown by `npm run preview`, generally `http://localhost:4173/`.

## Photos and gallery

The approved gallery image manifest and optimized photos are bundled with this frontend under `public/data/` and `public/media/client-2026/`. The gallery contains all 12 supplied folder categories. Do not delete those folders.
