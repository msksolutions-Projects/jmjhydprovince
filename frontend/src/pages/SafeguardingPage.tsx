import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { DocumentCard } from "@/components/common/DocumentCard";
import { Seo } from "@/components/seo/Seo";
import { safeguardingDocuments } from "@/data/safeguardingDocuments";

export function SafeguardingPage() {
  return (
    <>
      <Seo
        title="Safeguarding Policy and Forms"
        description="Approved safeguarding policy and the four annexure forms supplied by JMJ Hyderabad Province."
        path="/ministries/safeguarding"
      />
      <PageHeader
        eyebrow="Mission"
        title="Safeguarding"
        description="Access the approved safeguarding policy and accompanying annexure forms."
        breadcrumbs={[{ label: "Mission", href: "/ministries/education" }]}
      />
      <PageShell>
        <p className="text-muted" style={{ maxWidth: 760 }}>
          All five documents are available to view or download as PDFs. These are the documents supplied by the
          Province for publication; their content has not been changed.
        </p>
        <ul className="reset-list grid grid--2">
          {safeguardingDocuments.map((document) => (
            <li key={document.file}>
              <DocumentCard title={document.title} file={document.file} bytes={document.bytes} description={document.description} />
            </li>
          ))}
        </ul>
        <p className="small text-muted" style={{ marginTop: 20 }}>
          For more Province resources, visit <Link to="/publications">Publications</Link>.
        </p>
      </PageShell>
    </>
  );
}
