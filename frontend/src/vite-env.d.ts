/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PROXY?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
