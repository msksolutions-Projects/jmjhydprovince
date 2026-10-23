import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";

const M = "/media/client-2026";

export function OurLifePage() {
  return (
    <>
      <Seo title="How We Live" description="The life, spirituality and charism of the Sisters of Jesus Mary Joseph, Hyderabad Province." path="/who-we-are/our-life" />
      <PageHeader
        eyebrow="Community"
        title="How We Live"
        description="Our life, mission and spirituality as Sisters of Jesus Mary Joseph."
        breadcrumbs={[{ label: "Community" }]}
        image={`${M}/pcci-meet/1TELjtYX0OUg2sCDG-Gj2lfNbQd4HokFX-md.webp`}
      />
      <PageShell>
        <article className="panel prose" style={{ maxWidth: "none" }}>
          <h2 style={{ marginTop: 0 }}>Who we are</h2>
          <p>
            We, the Sisters of the Congregation of Jesus Mary Joseph (JMJ), Hyderabad Province, are called by the Spirit
            to cross the frontiers of culture, language, and belief. Through our life and mission in international
            communities, we strive to carry forward the mission of Christ through our apostolic ministries. Inspired by
            the vision and spirituality of our Founder, Rev. Fr. Mathias Wolff, S.J., we remain faithful to our
            religious vocation and committed to living our charism of “Ever Adaptable Apostolic Availability” in
            response to the evolving needs of the Church and the world.
          </p>
        </article>
        <h2 style={{ fontSize: "1.4rem", margin: "32px 0 16px" }}>Explore our life and mission</h2>
        <div className="grid grid--3">
          {[
            { href: "/who-we-are/vision-mission", label: "Vision & Mission", text: "Our purpose and charism.", icon: "eye" as const },
            { href: "/ministries/formation", label: "Formation", text: "The stages of becoming a JMJ sister.", icon: "users" as const },
            { href: "/who-we-are/founder", label: "Our Founder", text: "Rev. Fr. Mathias Wolff S.J.", icon: "star" as const },
          ].map((item) => (
            <article className="card card--link" key={item.href}>
              <div className="card__body">
                <div className="card__icon">
                  <Icon name={item.icon} />
                </div>
                <h3>
                  <Link to={item.href} className="stretched">
                    {item.label}
                  </Link>
                </h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </PageShell>
    </>
  );
}
