import { Helmet } from "react-helmet-async";
import { site } from "@/data/site";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://jmjhyderabadprovince.org";

export interface SeoProps {
  title: string;
  description?: string;
  /** Path beginning with "/" — used for the canonical URL. */
  path?: string;
  image?: string;
  type?: "website" | "article";
  /** Additional JSON-LD graph nodes. Only emit values present in the source content. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

export function Seo({
  title,
  description = site.description,
  path = "/",
  image = "/og-image.jpg",
  type = "website",
  jsonLd,
  noIndex = false,
}: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === site.name ? title : `${title} — ${site.name}`;
  const graph = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:site_name" content={site.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />

      {graph.map((node, index) => (
        <script type="application/ld+json" key={index}>
          {JSON.stringify(node)}
        </script>
      ))}
    </Helmet>
  );
}
