import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttachmentList } from "./AttachmentList";

describe("AttachmentList", () => {
  it("shows photos and downloadable files", () => {
    render(
      <AttachmentList
        items={[
          { name: "Circular 5.pdf", url: "/uploads/c.pdf", kind: "pdf", size: 2_400_000 },
          { name: "Timetable.docx", url: "/uploads/t.docx", kind: "document", size: 18_000 },
          { name: "feast.jpg", url: "/uploads/f.webp", thumbUrl: "/uploads/f-thumb.webp", kind: "image" },
        ]}
      />,
    );
    const pdf = screen.getByRole("link", { name: /circular 5\.pdf/i });
    expect(pdf).toHaveAttribute("href", "/uploads/c.pdf");
    expect(pdf).toHaveTextContent("PDF");
    expect(pdf).toHaveTextContent("2.3 MB");
    expect(screen.getByRole("link", { name: /timetable/i })).toHaveTextContent("DOCX");
    expect(screen.getByRole("img", { name: "feast" })).toHaveAttribute("src", "/uploads/f-thumb.webp");
  });

  it("renders nothing without attachments", () => {
    const { container } = render(<AttachmentList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
