import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { navigation } from "@/data/navigation";
import { site } from "@/data/site";

const tel = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

const quickLinks = [
  { label: "Our Founder", href: "/who-we-are/founder" },
  { label: "How We Live", href: "/who-we-are/our-life" },
  { label: "Formation", href: "/ministries/formation" },
  { label: "Administration Team", href: "/administration/team" },
  { label: "Institutions", href: "/institutions" },
  { label: "Photo Gallery", href: "/gallery" },
  { label: "Convent Directory", href: "/contact/convents" },
];

const column = (id: string) => navigation.find((group) => group.id === id);

export function SiteFooter() {
  const mission = column("mission");
  const media = column("media");

  return (
    <footer className="footer">
      <div className="container footer__main">
        <div>
          <div className="footer__brand">
            <img src="/brand/jmj-logo-128.webp" srcSet="/brand/jmj-logo-128.webp 1x, /brand/jmj-logo-256.webp 2x" alt="" width={64} height={64} loading="lazy" />
            <div>
              <strong>Congregation of Jesus Mary Joseph</strong>
              <span>Hyderabad Province</span>
            </div>
          </div>
          <p>
            Serving in India since 1904 through education, health care, social work, formation and pastoral
            ministry across Telangana, Andhra Pradesh and Madhya Pradesh.
          </p>
          <p className="footer__motto">“An Ever Adaptable Apostolic Availability”</p>
        </div>

        <nav aria-label="Quick links">
          <h2>Quick Links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {mission && (
          <nav aria-label="Mission">
            <h2>Our Mission</h2>
            <ul>
              {mission.items?.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {media && (
          <nav aria-label="Media">
            <h2>Media</h2>
            <ul>
              {media.items?.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <a href="https://congregationjmj.org/" target="_blank" rel="noopener noreferrer">
                  Congregation JMJ website
                </a>
              </li>
            </ul>
          </nav>
        )}

        <div>
          <h2>Provincial House</h2>
          <address>
            <div>
              <Icon name="pin" />
              <span>{site.address}</span>
            </div>
            <div>
              <Icon name="phone" />
              <span>
                <a href={tel(site.phone)}>{site.phone}</a>
                <br />
                <a href={tel(site.alternatePhone)}>{site.alternatePhone}</a>
              </span>
            </div>
            <div>
              <Icon name="printer" />
              <span>Fax: {site.fax}</span>
            </div>
            <div>
              <Icon name="mail" />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <div>
              <Icon name="clock" />
              <span>Mon–Sat, 08:00–18:00</span>
            </div>
          </address>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <span>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </span>
          <ul className="reset-list">
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/ministries/safeguarding">Safeguarding</Link>
            </li>
            <li>
              <Link to="/admin/login">Staff login</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
