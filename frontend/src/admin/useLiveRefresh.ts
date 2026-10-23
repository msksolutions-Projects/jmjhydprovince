import { useEffect, useRef } from "react";

/**
 * Calls `refresh` every `intervalMs` while the tab is visible, and right away
 * when the admin returns to the tab — so new contact messages appear without
 * reloading the page.
 */
export function useLiveRefresh(refresh: () => void, intervalMs = 20000) {
  const ref = useRef(refresh);
  ref.current = refresh;

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") ref.current();
    };
    const timer = window.setInterval(tick, intervalMs);
    const onFocus = () => ref.current();
    const onVisible = () => document.visibilityState === "visible" && ref.current();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
}
