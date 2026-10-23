import { Link, useLocation } from "react-router-dom";
import { PageHeader, type PageHeaderCrumb } from "@/components/common/PageHeader";
import { ContentMarkdown } from "@/components/common/ContentMarkdown";
import { PageShell } from "@/components/common/PageShell";
import { Seo } from "@/components/seo/Seo";
import { breadcrumbSchema } from "@/components/seo/schema";
import { getSection, toTitleCase } from "@/services/content";
import { websiteHyderabadAdditions } from "@/data/websiteHyderabadAdditions";
import { crumbsFor, findGroup } from "@/data/navigation";

const descriptions: Record<string, string> = {
  "our-founder": "The life, ministry and charism of Rev. Fr. Mathias Wolff S.J.",
  "our-history": "The journey of the Society of Jesus Mary Joseph from Holland to India and the wider world.",
  "missionary-work": "The arrival and service of the first missionary sisters in India.",
  "vision-mission": "Our vision, mission and ever-adaptable apostolic availability.",
  formation: "A person-oriented, contextualised and integral journey into the likeness of Christ.",
  education: "The beginnings and continuing mission of JMJ education in India.",
  "province-profile": "JMJ Hyderabad Province, its apostolates, collaborations and programme.",
  "social-work": "Preferential love of the poor expressed through the social apostolate.",
  "health-care": "Compassionate healing, nursing education and accessible health programmes.",
  "pastoral-and-evangelization": "Pastoral presence and proclamation of the Good News.",
  "eco-friendliness-and-protection": "Ecological fellowship, JPIC and responsibility for creation.",
  "provincial-superiors": "Provincial leadership through the years and current council members.",
  "administration-team": "The leadership team serving JMJ Hyderabad Province.",
  "province-commissions": "Commission members serving education, health care, formation, finance and other apostolates.",
  institutions: "Detailed profiles of JMJ institutions and their service.",
  "the-congregation-worldwide": "The Congregation of Jesus Mary Joseph across India, Ghana, Italy and the United States.",
  "news-and-updates": "Announcements and updates published by the provincial office.",
};

/** Faint banner photographs, from albums whose subject matches the page. */
const bannerImages: Record<string, string> = {
  formation: "/media/client-2026/novices/1b4A_QVRtmMc2H9GVexKHZs66yPGBg3h4-md.webp",
  "pastoral-and-evangelization": "/media/client-2026/youth-fest-2025/1FiFzkmmH5DV0eYrv7Mlc3YRIXy_gAT09-md.webp",
  "social-work": "/media/client-2026/lay-collaboration/1zmwA3WZ21znW5uWK9PudeAmHywllDCTZ-md.webp",
};

// Only pair ministry pages with photos whose supplied album identifies the activity.
const ministryPhotos: Record<string, { src: string; label: string }[]> = {
  formation: [
    { src: "/media/client-2026/aspirancy/1MIs1ZJGxf-D8kglb0uH0R8atZSi1GeCW-thumb.webp", label: "Aspirancy · 2026" },
    { src: "/media/client-2026/postulency/1sYg5bX9alhqe2xkjSK2V_aW86xY52-jf-thumb.webp", label: "Postulancy · 2025" },
    { src: "/media/client-2026/novices/1b4A_QVRtmMc2H9GVexKHZs66yPGBg3h4-thumb.webp", label: "Novices · 2025" },
  ],
  "pastoral-and-evangelization": [
    { src: "/media/client-2026/youth-fest-2025/1FiFzkmmH5DV0eYrv7Mlc3YRIXy_gAT09-thumb.webp", label: "Youth Fest · Kurnool 2025" },
    { src: "/media/client-2026/youth-fest-2025/1yJTX6AmcyuKzj6PHR6FkXAxUX41_0VXH-thumb.webp", label: "Youth Fest liturgy · 2025" },
  ],
  "social-work": [
    { src: "/media/client-2026/lay-collaboration/1zmwA3WZ21znW5uWK9PudeAmHywllDCTZ-thumb.webp", label: "Lay Collaboration gathering · 2026" },
  ],
};

export interface ContentPageProps {
  slug: string;
  eyebrow?: string;
  breadcrumbs?: PageHeaderCrumb[];
}

export function ContentPage({ slug, eyebrow, breadcrumbs }: ContentPageProps) {
  const section = getSection(slug);
  const { pathname } = useLocation();
  const title = toTitleCase(section.title);
  const description = descriptions[slug];
  const photos = ministryPhotos[slug] ?? [];
  const newContent = websiteHyderabadAdditions[slug];
  const trail = breadcrumbs ?? crumbsFor(pathname);
  const toc = section.headings.filter((h) => h.level === 2);

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={pathname}
        type="article"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          ...trail.map((c) => ({ name: c.label, path: c.href ?? pathname })),
          { name: title, path: pathname },
        ])}
      />
      <PageHeader
        eyebrow={eyebrow ?? findGroup(pathname)?.label ?? "JMJ Hyderabad Province"}
        title={title}
        description={description}
        breadcrumbs={trail}
        image={bannerImages[slug]}
      />
      <PageShell>
        {photos.length > 0 && (
          <section aria-label="Province photographs">
            <div className="photo-strip">
              {photos.map((photo) => (
                <figure key={photo.src}>
                  <img src={photo.src} alt={photo.label} loading="lazy" decoding="async" width={500} height={375} />
                  <figcaption>{photo.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {toc.length >= 3 && (
          <nav className="toc" aria-label="On this page">
            <div className="toc__title">On this page</div>
            <ul>
              {toc.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <article className="panel">
          {slug === "our-founder" && (
            <figure className="founder-portrait">
              <picture>
                <source srcSet="/brand/founder-mathias-wolff.webp" type="image/webp" />
                <img src="/brand/founder-mathias-wolff.png" alt="Portrait of Rev. Fr. Mathias Wolff S.J." width={196} height={258} decoding="async" fetchPriority="high" />
              </picture>
              <figcaption>
                <strong>Rev. Fr. Mathias Wolff S.J.</strong>
                <span>1779 – 1857 · Founder</span>
              </figcaption>
            </figure>
          )}
          <ContentMarkdown markdown={section.markdown} />
        </article>
        {newContent && (
          <section className="panel" aria-label="Further Province information">
            <div className="eyebrow">Further information</div>
            <ContentMarkdown markdown={newContent} />
          </section>
        )}
        {photos.length > 0 && (
          <p style={{ marginTop: 16 }}>
            <Link className="link-arrow" to="/gallery">
              Explore all 12 photo collections →
            </Link>
          </p>
        )}
      </PageShell>
    </>
  );
}
