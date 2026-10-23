import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";
import { ExploreSections } from "@/components/common/PageShell";

export function NotFoundPage() {
  return (
    <div className="container">
      <Seo title="Page not found" noIndex />
      <div className="notfound">
        <strong>404</strong>
        <h1 style={{ fontSize: "1.8rem", margin: "8px 0" }}>Page not found</h1>
        <p className="text-muted">The page may have moved or the address may be incorrect.</p>
        <Link to="/" className="btn">
          <Icon name="home" /> Return home
        </Link>
      </div>
      <div style={{ paddingBottom: 64 }}>
        <ExploreSections pathname="/404" />
      </div>
    </div>
  );
}
