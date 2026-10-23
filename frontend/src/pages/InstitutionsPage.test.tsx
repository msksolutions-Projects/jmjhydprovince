import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstitutionsPage } from "./InstitutionsPage";
import { renderWithProviders } from "@/test/utils";

describe("InstitutionsPage", () => {
  it("lists every institution by default", async () => {
    const { container } = renderWithProviders(<InstitutionsPage />);
    expect(await screen.findByText(/showing 32 of 32 institutions/i)).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("narrows the list as the visitor searches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InstitutionsPage />);
    await user.type(screen.getByLabelText(/search institutions/i), "Kurnool");
    await waitFor(() =>
      expect(screen.getByRole("status")).not.toHaveTextContent(/showing 32 of 32/i),
    );
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InstitutionsPage />);
    await user.type(screen.getByLabelText(/search institutions/i), "zzzznotthere");
    expect(await screen.findByText(/no institutions match those filters/i)).toBeInTheDocument();
  });

  it("offers a reset once a filter is applied", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InstitutionsPage />);
    await user.type(screen.getByLabelText(/search institutions/i), "Kurnool");
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /reset filters/i }).length).toBeGreaterThan(0),
    );
  });

  it("reads filters from the URL", async () => {
    renderWithProviders(<InstitutionsPage />, { initialEntries: ["/institutions?q=Achampet"] });
    await waitFor(() =>
      expect(screen.getByLabelText(/search institutions/i)).toHaveValue("Achampet"),
    );
  });
});
