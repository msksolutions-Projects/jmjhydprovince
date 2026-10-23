import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import { RequireAdmin } from "./AdminAuth";
import { useAdmin } from "./adminContext";
import { initials } from "./utils";
import adminApi from "./adminApi";
import { useLiveRefresh } from "./useLiveRefresh";

const links: { to: string; label: string; icon: IconName }[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/admin/news", label: "News", icon: "news" },
  { to: "/admin/notices", label: "Notices", icon: "bell" },
  { to: "/admin/gallery", label: "Gallery", icon: "image" },
  { to: "/admin/messages", label: "Messages", icon: "mail" },
];

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/news": "News",
  "/admin/notices": "Notices",
  "/admin/gallery": "Gallery",
  "/admin/messages": "Messages",
  "/admin/account": "Account",
};

function UserMenu() {
  const { admin, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="a-user" ref={ref}>
      <button type="button" className="a-user__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="a-avatar" aria-hidden="true">{initials(admin?.name)}</span>
        <span className="a-user__name">{admin?.name ?? "Administrator"}</span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="a-menu" role="menu">
          <div className="a-menu__head">
            <span className="a-avatar a-avatar--lg" aria-hidden="true">{initials(admin?.name)}</span>
            <div style={{ minWidth: 0 }}>
              <strong>{admin?.name ?? "Administrator"}</strong>
              <span>{admin?.email}</span>
              {admin?.role && <div><span className="a-pill a-pill--plain medium" style={{ marginTop: 4 }}>{admin.role}</span></div>}
            </div>
          </div>
          <Link className="a-menu__item" role="menuitem" to="/admin/account" onClick={() => setOpen(false)}>
            <Icon name="user" /> Account &amp; password
          </Link>
          <a className="a-menu__item" role="menuitem" href="/" target="_blank" rel="noopener noreferrer">
            <Icon name="external" /> View website
          </a>
          <button type="button" className="a-menu__item a-menu__item--danger" role="menuitem" onClick={() => void logout()}>
            <Icon name="logout" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const { logout } = useAdmin();
  const [sideOpen, setSideOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setSideOpen(false), [pathname]);

  // Unread contact messages badge: on navigation, every 30 s, and when returning to the tab.
  const refreshUnread = useCallback(() => {
    adminApi
      .get("/contact", { params: { status: "new", limit: 1 } })
      .then((res) => setUnread(Number(res.data?.unread) || 0))
      .catch(() => {});
  }, []);
  useEffect(() => refreshUnread(), [pathname, refreshUnread]);
  useLiveRefresh(refreshUnread, 30000);

  return (
    <div className="a-shell">
      {sideOpen && <div className="a-backdrop" onClick={() => setSideOpen(false)} aria-hidden="true" />}
      <aside className={`a-side${sideOpen ? " is-open" : ""}`} aria-label="Admin navigation">
        <div className="a-side__brand">
          <img className="a-side__logo" src="/brand/jmj-logo-128.webp" srcSet="/brand/jmj-logo-128.webp 1x, /brand/jmj-logo-256.webp 2x" alt="" width={40} height={40} />
          <div>
            <strong>JMJ Admin</strong>
            <span>Hyderabad Province</span>
          </div>
        </div>
        <div className="a-side__label">Content</div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="a-navlink">
              <Icon name={link.icon} />
              {link.label}
              {link.to === "/admin/messages" && unread > 0 && (
                <span className="a-count" aria-label={`${unread} unread`}>{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="a-side__label">Settings</div>
        <nav>
          <NavLink to="/admin/account" className="a-navlink">
            <Icon name="user" /> Account
          </NavLink>
        </nav>
        <div className="a-side__foot">
          <a className="a-navlink" href="/" target="_blank" rel="noopener noreferrer">
            <Icon name="globe" /> View website
          </a>
          <button type="button" className="a-navlink" style={{ border: 0, background: "none", width: "100%", textAlign: "left" }} onClick={() => void logout()}>
            <Icon name="logout" /> Log out
          </button>
        </div>
      </aside>

      <div className="a-main">
        <header className="a-top">
          <button type="button" className="a-icon-btn a-top__menu" aria-label="Open admin menu" onClick={() => setSideOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="a-crumbs">
            <Link to="/admin/dashboard" style={{ color: "inherit" }}>Admin</Link>
            <Icon name="chevronRight" size={14} />
            <strong>{titles[pathname] ?? "Admin"}</strong>
          </div>
          <div className="a-top__right">
            <UserMenu />
          </div>
        </header>
        <main className="a-content" id="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Protected admin area: sidebar + top bar around each admin page. */
export default function AdminLayout() {
  return (
    <RequireAdmin>
      <Shell />
    </RequireAdmin>
  );
}
