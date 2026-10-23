import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalleryPage } from "./GalleryPage";
import { renderWithProviders } from "@/test/utils";

afterEach(() => vi.unstubAllGlobals());

describe("GalleryPage", () => {
  it("shows clean photographs without the image title, year or collection caption", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        categories: [{ id: "postulency", label: "Postulency", count: 1 }],
        images: [{
          id: "photo-1",
          title: "PT - 2025",
          alt: "Sisters standing together",
          category: "postulency",
          categoryLabel: "Postulency",
          src: "/photo.webp",
          thumbnail: "/thumb.webp",
          width: 1200,
          height: 900,
        }],
      }),
    }));

    const user = userEvent.setup();
    renderWithProviders(<GalleryPage />, { initialEntries: ["/gallery"] });

    const tile = await screen.findByRole("button", { name: "View photograph 1" });
    expect(screen.getByText("Postulency (1)")).toBeInTheDocument();
    expect(screen.queryByText("PT - 2025")).not.toBeInTheDocument();
    expect(screen.queryByText("Postulency", { exact: true })).not.toBeInTheDocument();

    await user.click(tile);
    const viewer = screen.getByRole("dialog");
    expect(within(viewer).getByRole("img", { name: "Sisters standing together" })).toBeInTheDocument();
    expect(within(viewer).queryByText("PT - 2025")).not.toBeInTheDocument();
    expect(within(viewer).queryByText("Postulency")).not.toBeInTheDocument();
  });
});
