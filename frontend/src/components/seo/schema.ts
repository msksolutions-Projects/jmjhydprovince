import { site } from "@/data/site";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://jmjhyderabadprovince.org";

/** Organization schema. Values come from the verified site config only. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.fullName,
  alternateName: site.name,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/jmj-logo.png`,
  email: site.email,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jyothinilayam, 6-3-900 Somajiguda, Rajbhavan Road, Street No. 9",
    addressLocality: "Hyderabad",
    postalCode: "500082",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
};

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: `${SITE_URL}${crumb.path}`,
  })),
});
