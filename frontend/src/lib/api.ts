/**
 * Base address of the Express API.
 * - Same server / dev proxy (default): "/api/v1"
 * - Separate API host: set VITE_API_BASE_URL=https://api.example.org/api/v1 in frontend/.env
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
