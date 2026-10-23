import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Google Analytics 4, loaded only when VITE_GA_ID is set. Admin pages are never tracked. */
export function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!GA_ID || window.gtag) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
  }, []);

  useEffect(() => {
    if (!GA_ID || !window.gtag || pathname.startsWith("/admin")) return;
    window.gtag("event", "page_view", { page_path: pathname + search, page_location: window.location.href, page_title: document.title });
  }, [pathname, search]);

  return null;
}
