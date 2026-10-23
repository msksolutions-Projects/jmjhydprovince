import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { Seo } from "@/components/seo/Seo";
import { organizationSchema } from "@/components/seo/schema";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/features/contact/ContactForm";
import { site } from "@/data/site";

const tel = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact"
        description="Contact the provincial office of JMJ Hyderabad Province at Jyothinilayam, Somajiguda, Hyderabad."
        path="/contact"
        jsonLd={organizationSchema}
      />
      <PageHeader
        eyebrow="Get in touch"
        title="Contact the Provincial Office"
        description="For admissions, collaboration, vocation enquiries, or anything concerning a particular institution or community."
      />
      <PageShell sidebar={false}>
        <div className="two-col">
          <section className="panel" aria-labelledby="form-title">
            <h2 id="form-title" style={{ fontSize: "1.5rem", marginBottom: 6 }}>
              Send us a message
            </h2>
            <p className="text-muted">Fields marked with an asterisk are required. We reply as soon as the office is able.</p>
            <ContactForm />
          </section>

          <div className="stack">
            <section className="panel" style={{ padding: 24 }} aria-labelledby="house-title">
              <div className="eyebrow" id="house-title">Provincial House</div>
              <div className="info-list">
                <div>
                  <Icon name="pin" />
                  <span>
                    <small>Address</small>
                    {site.address}
                  </span>
                </div>
                <div>
                  <Icon name="phone" />
                  <span>
                    <small>Telephone</small>
                    <a href={tel(site.phone)}>{site.phone}</a> · <a href={tel(site.alternatePhone)}>{site.alternatePhone}</a>
                  </span>
                </div>
                <div>
                  <Icon name="mail" />
                  <span>
                    <small>Email</small>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                  </span>
                </div>
                <div>
                  <Icon name="clock" />
                  <span>
                    <small>Office hours</small>
                    08:00 – 18:00, Monday to Saturday
                  </span>
                </div>
              </div>
              <div className="stack" style={{ marginTop: 20 }}>
                <a className="btn btn--block" href={tel(site.phone)}>
                  <Icon name="phone" /> Call the office
                </a>
                <Link className="btn btn--outline btn--block" to="/contact/convents">
                  <Icon name="building" /> Browse the convent directory
                </Link>
              </div>
            </section>
            <iframe
              className="map-frame"
              title="Map showing the provincial house at Somajiguda, Hyderabad"
              src="https://www.google.com/maps?q=Somajiguda+Hyderabad&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </PageShell>
    </>
  );
}
