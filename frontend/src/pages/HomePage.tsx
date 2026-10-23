import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { organizationSchema } from "@/components/seo/schema";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CountUp } from "@/components/common/CountUp";
import { HeroSlider } from "@/features/home/HeroSlider";
import { featuredAlbums } from "@/features/gallery/albums";
import { fetchUploadedPhotos, UPLOADS_ID } from "@/features/gallery/gallery.service";
import { fetchPublishedNews, newsDate } from "@/features/news/news.service";

const M = "/media/client-2026";

const quickLinks: { label: string; sub: string; href: string; icon: IconName }[] = [
  { label: "Who We Are", sub: "Founder, history & charism", href: "/who-we-are/founder", icon: "star" },
  { label: "Our Mission", sub: "Six apostolates", href: "/ministries/education", icon: "heart" },
  { label: "Institutions", sub: "32 schools, hospitals & homes", href: "/institutions", icon: "building" },
  { label: "Joining Us", sub: "Stages of formation", href: "/ministries/formation", icon: "users" },
];

const ministries: { label: string; description: string; href: string; icon: IconName }[] = [
  { label: "Education", description: "Schools, colleges and teacher training that form the person to fullness of life.", href: "/ministries/education", icon: "school" },
  { label: "Health Care", description: "Hospitals, nursing education and rural health programmes.", href: "/ministries/health-care", icon: "health" },
  { label: "Social Work", description: "Service with people who are poor, tribal, marginalized and voiceless.", href: "/ministries/social-work", icon: "social" },
  { label: "Formation", description: "Pre-postulancy through juniorate, forming sisters for the mission.", href: "/ministries/formation", icon: "users" },
  { label: "Pastoral and Evangelization", description: "Parish accompaniment, catechesis and presence in local communities.", href: "/ministries/pastoral-evangelization", icon: "church" },
  { label: "Eco Friendliness and Protection", description: "Ecological fellowship and care for the integrity of creation.", href: "/ministries/eco-friendliness", icon: "leaf" },
];

/** Only dates carried unambiguously by the source content appear here. */
const milestones: [string, string][] = [
  ["1822", "The Society is founded in Holland by Fr. Mathias Wolff S.J."],
  ["1904", "The first missionary sisters arrive in Guntur."],
  ["1987", "The Indian Province is divided and Hyderabad Province is established."],
  ["2016", "The Congregation of Jesus Mary Joseph is established by decree."],
];

const provinces = [
  { name: "Congregation of Jesus Mary Joseph", site: "congregationjmj.org", href: "https://congregationjmj.org/" },
  { name: "Guntur Province", site: "jmjgunturprovince.org", href: "https://jmjgunturprovince.org/" },
  { name: "Hyderabad Province", site: "You are here", href: null },
  { name: "Raipur Province", site: "jmjraipur.in", href: "https://jmjraipur.in/" },
];

function SectionHead({ eyebrow, title, intro, center = false }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={`section-head${center ? " section-head--center" : ""}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}

function LatestNews() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-news"],
    queryFn: ({ signal }) => fetchPublishedNews(signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const items = (data ?? []).slice(0, 4);

  if (isPending) {
    return (
      <div className="news-list" aria-busy="true" aria-label="Loading news">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 88 }} />
        ))}
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <div className="news-list">
        <Link to="/news" className="news-item">
          <span className="news-item__date">
            <Icon name="news" size={26} />
          </span>
          <span>
            <h3>News &amp; Updates</h3>
            <p>Province announcements, celebrations and events as they are published.</p>
          </span>
        </Link>
        <Link to="/notices" className="news-item">
          <span className="news-item__date">
            <Icon name="bell" size={26} />
          </span>
          <span>
            <h3>Notices</h3>
            <p>Important announcements from the provincial office.</p>
          </span>
        </Link>
        <Link to="/gallery" className="news-item">
          <span className="news-item__date">
            <Icon name="image" size={26} />
          </span>
          <span>
            <h3>Recent photographs</h3>
            <p>Lay Collaboration 2026, PCCI Meet, Youth Fest and more.</p>
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="news-list">
      {items.map((item) => {
        const date = newsDate(item);
        return (
          <Link to="/news" className="news-item" key={item._id}>
            <span className="news-item__date">
              <b>{date.getDate()}</b>
              <small>{date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</small>
            </span>
            <span>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Album tiles: a "Latest uploads" tile leads when the admin has published new photos. */
function useAlbumTiles() {
  const { data: uploads = [] } = useQuery({
    queryKey: ["gallery-uploads-home"],
    queryFn: ({ signal }) => fetchUploadedPhotos(signal, 50),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const tiles = featuredAlbums.map((a) => ({ id: a.id as string, label: a.label as string, meta: a.meta as string, cover: a.cover as string, href: `/gallery?category=${a.id}` }));
  if (!uploads.length) return tiles;
  return [
    {
      id: UPLOADS_ID,
      label: "Latest uploads",
      meta: `${uploads.length} new ${uploads.length === 1 ? "photo" : "photos"}`,
      cover: uploads[0]!.thumbnail,
      href: `/gallery?category=${UPLOADS_ID}`,
    },
    ...tiles.slice(0, 3),
  ];
}

export function HomePage() {
  const albums = useAlbumTiles();
  return (
    <>
      <Seo
        title="JMJ Hyderabad Province"
        description="The Congregation of Jesus Mary Joseph, Hyderabad Province — serving through education, health care, social work and formation across Telangana, Andhra Pradesh and Madhya Pradesh since 1904."
        path="/"
        jsonLd={organizationSchema}
      />

      <HeroSlider />

      {/* Quick links */}
      <nav className="quick" aria-label="Start here">
        <div className="container">
          <div className="quick__grid">
            {quickLinks.map((item) => (
              <Link key={item.label} to={item.href}>
                <span className="quick__icon">
                  <Icon name={item.icon} />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <span>{item.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Welcome */}
      <section className="section section--white" aria-labelledby="welcome-title">
        <div className="container welcome">
          <div>
            <div className="eyebrow">Welcome</div>
            <h2 id="welcome-title">Jesus Mary Joseph — the name we carry</h2>
            <p>
              Jesus Mary Joseph is the name of the Congregation. The sisters of this Congregation are called J.M.J.
              Sisters, after the name given by our Founder at the founding of the Society in 1822.
            </p>
            <p>
              Every sister is called to involve herself in the plan of salvation and, after the example of Jesus,
              Mary and Joseph, to carry out Jesus&rsquo; ministry of liberation by building up His world. The
              Hyderabad Province continues this mission through schools, hospitals, nursing colleges, social service
              societies and formation houses across three states.
            </p>
            <div className="row" style={{ marginTop: 22 }}>
              <Link className="btn" to="/who-we-are/province-profile">
                About the Province <Icon name="arrowRight" />
              </Link>
              <Link className="btn btn--outline" to="/who-we-are/history">
                Our history
              </Link>
            </div>
          </div>
          <figure className="welcome__figure">
            <img
              src={`${M}/pcci-meet/1TELjtYX0OUg2sCDG-Gj2lfNbQd4HokFX-md.webp`}
              srcSet={`${M}/pcci-meet/1TELjtYX0OUg2sCDG-Gj2lfNbQd4HokFX-thumb.webp 500w, ${M}/pcci-meet/1TELjtYX0OUg2sCDG-Gj2lfNbQd4HokFX-md.webp 1000w`}
              sizes="(min-width: 900px) 560px, 100vw"
              alt="Sisters participating in the PCCI Meet"
              width={1000}
              height={750}
              loading="lazy"
              decoding="async"
            />
            <div className="welcome__badge">
              <strong>1904</strong>
              <span>Serving in India since</span>
            </div>
          </figure>
        </div>
      </section>

      {/* Founder + Vision (mirrors the Founder / Mary Glowrey pair on the Congregation site) */}
      <section className="section section--sky" aria-label="Our founder and our vision">
        <div className="container">
          <div className="grid grid--2">
            <article className="feature">
              <div className="feature__head">
                <picture className="feature__portrait">
                  <source srcSet="/brand/founder-mathias-wolff.webp" type="image/webp" />
                  <img src="/brand/founder-mathias-wolff.png" alt="Portrait of Rev. Fr. Mathias Wolff S.J., founder of the Society of Jesus Mary Joseph" width={196} height={258} loading="lazy" decoding="async" />
                </picture>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>Our Founder</div>
                  <h3>Rev. Fr. Mathias Wolff S.J.</h3>
                  <div className="feature__sub">Diekirch 1779 – 1857 · Founded JMJ in 1822</div>
                </div>
              </div>
              <p>
                Born in Luxembourg, Fr. Mathias Wolff founded the Society of Jesus Mary Joseph in Amersfoort,
                Netherlands, in 1822, for the liberation of the oppressed, the poor, the voiceless and the
                marginalized.
              </p>
              <blockquote>“Always ready for souls, and I want to labour as a giant.”</blockquote>
              <div className="feature__actions">
                <Link className="btn btn--sm" to="/who-we-are/founder">
                  Read more <Icon name="arrowRight" />
                </Link>
                <Link className="btn btn--sm btn--outline" to="/who-we-are/missionary-work">
                  Missionary work
                </Link>
              </div>
            </article>
            <article className="feature">
              <div className="feature__head">
                <div className="feature__medal">
                  <Icon name="eye" />
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>Vision &amp; Mission</div>
                  <h3>Our Charism</h3>
                  <div className="feature__sub">An Ever-Adaptable Apostolic Availability</div>
                </div>
              </div>
              <p>
                In total surrender to the Will of the Father, with passion for God&rsquo;s Kingdom, like Mary and
                Joseph, we follow Christ the Saviour to liberate oppressed humanity through the ministries of mercy.
              </p>
              <blockquote>
                “We are sent to serve the poor and marginalized … with a global concern for justice, caring for the
                Integrity of Creation.”
              </blockquote>
              <div className="feature__actions">
                <Link className="btn btn--sm" to="/who-we-are/vision-mission">
                  Read more <Icon name="arrowRight" />
                </Link>
                <Link className="btn btn--sm btn--outline" to="/who-we-are/our-life">
                  How we live
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-band section" aria-label="Words of our founder">
        <img className="bg" src={`${M}/postulency/1sYg5bX9alhqe2xkjSK2V_aW86xY52-jf-md.webp`} alt="" loading="lazy" decoding="async" />
        <div className="container">
          <span className="quote-band__mark" aria-hidden="true">“</span>
          <blockquote>
            In keeping with the Charism, the sisters of J.M.J. are invited to be flexible, to adapt and avail
            themselves in carrying out its ministries to the needs of the Church and in solidarity with the world.
          </blockquote>
          <cite>Our Founder&rsquo;s Charism</cite>
        </div>
      </section>

      {/* Ministries */}
      <section className="section section--white" aria-labelledby="ministries-title">
        <div className="container">
          <div className="section-head section-head--center">
            <div className="eyebrow">Our Mission</div>
            <h2 id="ministries-title">Six apostolates, one mission</h2>
            <p>Each apostolate carries the same purpose into a different part of life — the classroom, the ward, the village, the novitiate.</p>
          </div>
          <div className="grid grid--3">
            {ministries.map((item) => (
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
                  <p>{item.description}</p>
                  <span className="link-arrow">
                    Learn more <Icon name="arrowRight" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="section section--navy" aria-labelledby="history-title">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Two centuries</div>
            <h2 id="history-title">From a small society in Holland to thirty-two institutions across the Deccan</h2>
          </div>
          <ol className="timeline">
            {milestones.map(([year, text]) => (
              <li key={year}>
                <strong>{year}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 36 }}>
            <Link className="btn btn--light" to="/who-we-are/history">
              Read our full history <Icon name="arrowRight" />
            </Link>
          </div>
        </div>
      </section>

      {/* News + newsletter */}
      <section className="section section--sky" aria-labelledby="news-title">
        <div className="container">
          <div className="section-head__row">
            <div className="section-head">
              <div className="eyebrow">Stay informed</div>
              <h2 id="news-title">Latest news &amp; publications</h2>
            </div>
            <Link className="link-arrow" to="/news">
              View all news <Icon name="arrowRight" />
            </Link>
          </div>
          <div className="two-col">
            <LatestNews />
            <div className="issue">
              <div className="issue__cover" aria-hidden="true">
                <b>News Strings</b>
                <span>13</span>
                <small>JMJ Hyderabad</small>
              </div>
              <div>
                <div className="eyebrow">Province newsletter</div>
                <h3>News Strings — Issue 13</h3>
                <p>Stories, reflections and events from our communities, published by the Province.</p>
                <div className="row">
                  <a className="btn btn--light btn--sm" href="/documents/publications/13-news-strings.pdf" target="_blank" rel="noopener noreferrer">
                    <Icon name="file" /> Read the PDF
                  </a>
                  <Link className="btn btn--ghost-light btn--sm" to="/publications">
                    All issues
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Presence */}
      <section className="section section--white" aria-labelledby="presence-title">
        <div className="container">
          <SectionHead
            eyebrow="Our Presence"
            title="Where we serve"
            intro="Communities and institutions across Telangana, Andhra Pradesh and Madhya Pradesh, united with JMJ provinces in India, Ghana, Italy and the United States."
          />
          <div className="stats">
            <Link className="stat" to="/institutions">
              <strong><CountUp value={32} /></strong>
              <span>Institutions</span>
            </Link>
            <Link className="stat" to="/contact/convents">
              <strong><CountUp value={25} /></strong>
              <span>Communities</span>
            </Link>
            <Link className="stat" to="/contact/convents">
              <strong><CountUp value={3} /></strong>
              <span>States served</span>
            </Link>
            <Link className="stat" to="/who-we-are/history">
              <strong><CountUp value={120} suffix="+" /></strong>
              <span>Years in India</span>
            </Link>
          </div>
          <div className="provinces">
            {provinces.map((province) =>
              province.href ? (
                <a key={province.name} href={province.href} target="_blank" rel="noopener noreferrer">
                  <Icon name="globe" />
                  <span>
                    <strong>{province.name}</strong>
                    <small>{province.site}</small>
                  </span>
                </a>
              ) : (
                <div key={province.name} className="is-current">
                  <Icon name="pin" />
                  <span>
                    <strong>{province.name}</strong>
                    <small>{province.site}</small>
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section section--sky" aria-labelledby="gallery-title">
        <div className="container">
          <div className="section-head__row">
            <div className="section-head">
              <div className="eyebrow">Photo Gallery</div>
              <h2 id="gallery-title">Moments from the Province</h2>
            </div>
            <Link className="link-arrow" to="/gallery">
              View all albums <Icon name="arrowRight" />
            </Link>
          </div>
          <div className="grid grid--4">
            {albums.map((album) => (
              <Link key={album.id} className="album" to={album.href}>
                <img src={album.cover} alt="" loading="lazy" decoding="async" width={500} height={375} />
                <span className="album__label">
                  <strong>{album.label}</strong>
                  <span>{album.meta}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band" aria-label="Get in touch">
        <div className="container">
          <div>
            <h2>You are welcome to write to us.</h2>
            <p>For admissions, collaboration, vocation enquiries, or anything concerning one of our communities.</p>
          </div>
          <div className="row">
            <Link className="btn btn--light" to="/contact">
              Contact the office <Icon name="arrowRight" />
            </Link>
            <Link className="btn btn--ghost-light" to="/contact/convents">
              Convent directory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
