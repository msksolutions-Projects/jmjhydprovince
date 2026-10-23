import { useEffect } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/common/SkipLink";
import { BackToTopButton } from "@/components/common/BackToTopButton";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Analytics } from "@/components/common/Analytics";
import { useScrollReveal } from "@/components/common/useScrollReveal";

export function AppLayout() {
  const { pathname, hash } = useLocation();
  const navigation = useNavigation();

  // Reset scroll on navigation and move focus to the new page's main region.
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname, hash]);

  useScrollReveal("main-content", pathname);

  return (
    <>
      {navigation.state === "loading" && <div className="route-progress" aria-hidden="true" />}
      <SkipLink />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} style={{ outline: "none", minHeight: "60vh" }}>
        <div className="page-enter" key={pathname}>
          <Outlet />
        </div>
      </main>
      <SiteFooter />
      <BackToTopButton />
      <WhatsAppButton />
      <Analytics />
    </>
  );
}
