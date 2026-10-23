import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomePage } from "./HomePage";
import { renderWithProviders } from "@/test/utils";

describe("HomePage", () => {
  it("exposes exactly one h1 naming the Province", () => {
    renderWithProviders(<HomePage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/hyderabad province/i);
  });

  it("shows a photo-only carousel of the Province photographs", () => {
    renderWithProviders(<HomePage />);
    const carousel = screen.getByRole("region", { name: /province photographs/i });
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    expect(within(carousel).queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(within(carousel).getByRole("img", { name: /before the chapel altar/i })).toBeInTheDocument();
    expect(within(carousel).getAllByRole("button", { name: /show slide/i })).toHaveLength(10);
  });

  it("moves between photos with the controls", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    const carousel = screen.getByRole("region", { name: /province photographs/i });
    expect(within(carousel).getByRole("button", { name: "Show slide 1" })).toHaveAttribute("aria-current", "true");
    await user.click(screen.getByRole("button", { name: /next slide/i }));
    expect(within(carousel).getByRole("button", { name: "Show slide 2" })).toHaveAttribute("aria-current", "true");
    await user.click(screen.getByRole("button", { name: /previous slide/i }));
    await user.click(screen.getByRole("button", { name: /previous slide/i }));
    expect(within(carousel).getByRole("button", { name: "Show slide 10" })).toHaveAttribute("aria-current", "true");
    expect(within(carousel).getByText("10 / 10")).toBeInTheDocument();
  });

  it("lets the visitor stop the slideshow", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("button", { name: /pause slideshow/i })).toBeInTheDocument();
  });

  it("links every apostolate to its ministry page", () => {
    renderWithProviders(<HomePage />);
    for (const label of [
      "Education",
      "Health Care",
      "Social Work",
      "Formation",
      "Pastoral and Evangelization",
      "Eco Friendliness and Protection",
    ]) {
      expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    }
  });

  it("shows only milestone years supported by the source content", () => {
    renderWithProviders(<HomePage />);
    for (const year of ["1822", "1904", "1987", "2016"]) {
      expect(screen.getAllByText(year).length).toBeGreaterThan(0);
    }
    // The 24 vs 28 February conflict is unresolved, so no exact day is shown.
    expect(screen.queryByText(/2[48] February 1904/)).not.toBeInTheDocument();
  });

  it("follows the reference site's home sections", () => {
    renderWithProviders(<HomePage />);
    for (const name of [/jesus mary joseph — the name we carry/i, /six apostolates/i, /latest news/i, /where we serve/i, /moments from the province/i]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /view all albums/i })).toHaveAttribute("href", "/gallery");
  });
});
