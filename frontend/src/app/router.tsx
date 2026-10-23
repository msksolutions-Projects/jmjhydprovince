import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteLoader } from "@/components/common/RouteLoader";
import { RouteErrorPage } from "@/components/common/RouteErrorPage";
import { HomePage } from "@/pages/HomePage";

const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType>>, name: T) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

// The home page is bundled with the shell for the fastest first paint; every
// other page is split into its own chunk and preloaded on link hover.
const ContentPage = lazy(() => import("@/pages/ContentPage").then((m) => ({ default: m.ContentPage })));
const DynamicContentPage = named(() => import("@/pages/DynamicContentPage"), "DynamicContentPage");
const InstitutionsPage = named(() => import("@/pages/InstitutionsPage"), "InstitutionsPage");
const InstitutionDetailPage = named(() => import("@/pages/InstitutionDetailPage"), "InstitutionDetailPage");
const DirectoryPage = named(() => import("@/pages/DirectoryPage"), "DirectoryPage");
const ContactPage = named(() => import("@/pages/ContactPage"), "ContactPage");
const GalleryPage = named(() => import("@/pages/GalleryPage"), "GalleryPage");
const PublicationsPage = named(() => import("@/pages/PublicationsPage"), "PublicationsPage");
const SafeguardingPage = named(() => import("@/pages/SafeguardingPage"), "SafeguardingPage");
const OurLifePage = named(() => import("@/pages/OurLifePage"), "OurLifePage");
const NewsPage = named(() => import("@/pages/NewsPage"), "NewsPage");
const NoticesPage = named(() => import("@/pages/NoticesPage"), "NoticesPage");
const NotFoundPage = named(() => import("@/pages/NotFoundPage"), "NotFoundPage");

const AdminRoot = lazy(() => import("@/admin/AdminRoot"));
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminLoginPage = named(() => import("@/admin/AdminLoginPage"), "AdminLoginPage");
const AdminRegisterPage = named(() => import("@/admin/AdminRegisterPage"), "AdminRegisterPage");
const AdminDashboardPage = named(() => import("@/admin/AdminDashboardPage"), "AdminDashboardPage");
const AdminNewsPage = named(() => import("@/admin/AdminNewsPage"), "AdminNewsPage");
const AdminNoticesPage = named(() => import("@/admin/AdminNoticesPage"), "AdminNoticesPage");
const AdminGalleryPage = named(() => import("@/admin/AdminGalleryPage"), "AdminGalleryPage");
const AdminMessagesPage = named(() => import("@/admin/AdminMessagesPage"), "AdminMessagesPage");
const AdminAccountPage = named(() => import("@/admin/AdminAccountPage"), "AdminAccountPage");

const wrap = (node: ReactNode) => <Suspense fallback={<RouteLoader />}>{node}</Suspense>;
const content = (slug: string) => wrap(<ContentPage slug={slug} />);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },

      // About Us
      { path: "who-we-are/founder", element: content("our-founder") },
      { path: "who-we-are/history", element: content("our-history") },
      { path: "who-we-are/missionary-work", element: content("missionary-work") },
      { path: "who-we-are/vision-mission", element: content("vision-mission") },
      { path: "who-we-are/province-profile", element: content("province-profile") },
      { path: "who-we-are/our-presence", element: content("the-congregation-worldwide") },
      { path: "worldwide", element: content("the-congregation-worldwide") },

      // Province leadership
      { path: "administration/provincial-superiors", element: content("provincial-superiors") },
      { path: "administration/team", element: content("administration-team") },
      { path: "administration/commissions", element: content("province-commissions") },

      // Mission
      { path: "ministries/education", element: content("education") },
      { path: "ministries/health-care", element: content("health-care") },
      { path: "ministries/social-work", element: content("social-work") },
      { path: "ministries/pastoral-evangelization", element: content("pastoral-and-evangelization") },
      { path: "ministries/eco-friendliness", element: content("eco-friendliness-and-protection") },
      { path: "ministries/safeguarding", element: wrap(<SafeguardingPage />) },

      // Community
      { path: "who-we-are/our-life", element: wrap(<OurLifePage />) },
      { path: "ministries/formation", element: content("formation") },
      { path: "contact/convents", element: wrap(<DirectoryPage />) },

      // Institutions
      { path: "institutions", element: wrap(<InstitutionsPage />) },
      { path: "institutions/:id", element: wrap(<InstitutionDetailPage />) },
      { path: "institution-profiles", element: content("institutions") },

      // Media
      { path: "news", element: wrap(<NewsPage />) },
      { path: "notices", element: wrap(<NoticesPage />) },
      { path: "publications", element: wrap(<PublicationsPage />) },
      { path: "gallery", element: wrap(<GalleryPage />) },

      // Contact
      { path: "contact", element: wrap(<ContactPage />) },

      { path: "content/:slug", element: wrap(<DynamicContentPage />) },
      { path: "*", element: wrap(<NotFoundPage />) },
    ],
  },
  {
    // Staff area: its own layout, no public header or footer.
    path: "admin",
    element: wrap(<AdminRoot />),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "login", element: wrap(<AdminLoginPage />) },
      { path: "register", element: wrap(<AdminRegisterPage />) },
      {
        element: wrap(<AdminLayout />),
        children: [
          { path: "dashboard", element: wrap(<AdminDashboardPage />) },
          { path: "news", element: wrap(<AdminNewsPage />) },
          { path: "notices", element: wrap(<AdminNoticesPage />) },
          { path: "gallery", element: wrap(<AdminGalleryPage />) },
          { path: "messages", element: wrap(<AdminMessagesPage />) },
          { path: "account", element: wrap(<AdminAccountPage />) },
          { path: "*", element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
    ],
  },
]);
