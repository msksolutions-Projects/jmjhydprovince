import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./SiteHeader";
import { renderWithProviders } from "@/test/utils";

describe("SiteHeader", () => {
  it("renders the main navigation landmark", () => {
    renderWithProviders(<SiteHeader />);
    expect(screen.getAllByRole("navigation", { name: /main/i }).length).toBeGreaterThan(0);
  });

  it("offers every section of the reference site map", () => {
    renderWithProviders(<SiteHeader />);
    const [desktop] = screen.getAllByRole("navigation", { name: /main/i });
    for (const label of ["About Us", "Province", "Mission", "Community", "Institutions", "Media"]) {
      expect(within(desktop!).getByRole("button", { name: label })).toBeInTheDocument();
    }
    expect(within(desktop!).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("marks menu buttons as collapsed until opened", () => {
    renderWithProviders(<SiteHeader />);
    const [desktop] = screen.getAllByRole("navigation", { name: /main/i });
    expect(within(desktop!).getByRole("button", { name: "About Us" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a submenu and exposes its items", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader />);
    const [desktop] = screen.getAllByRole("navigation", { name: /main/i });
    const button = within(desktop!).getByRole("button", { name: "About Us" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(within(desktop!).getByRole("link", { name: /our founder/i })).toHaveAttribute("href", "/who-we-are/founder");
  });

  it("marks the current page in the menu", () => {
    renderWithProviders(<SiteHeader />, { initialEntries: ["/ministries/education"] });
    const [desktop] = screen.getAllByRole("navigation", { name: /main/i });
    expect(within(desktop!).getByRole("link", { name: /^education schools, colleges/i })).toHaveAttribute("aria-current", "page");
  });

  it("opens the search dialog from the toolbar button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader />);
    await user.click(screen.getByRole("button", { name: /open search/i }));
    await waitFor(() => expect(screen.getByLabelText(/search this website/i)).toBeInTheDocument());
  });

  it("opens the mobile drawer with grouped navigation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader />);
    await user.click(screen.getByRole("button", { name: /open navigation menu/i }));
    const drawer = screen.getByRole("dialog", { name: /site menu/i });
    expect(drawer).toHaveClass("is-open");
    await user.click(within(drawer).getByRole("button", { name: "Mission" }));
    expect(within(drawer).getByRole("link", { name: /health care/i })).toBeInTheDocument();
  });
});
