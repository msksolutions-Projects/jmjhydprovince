import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { renderWithProviders } from "@/test/utils";

describe("GlobalSearchDialog", () => {
  it("prompts before two characters are typed", () => {
    renderWithProviders(<GlobalSearchDialog open onClose={vi.fn()} />);
    expect(screen.getByText(/search across pages, ministries/i)).toBeInTheDocument();
  });

  it("shows grouped results for a matching query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GlobalSearchDialog open onClose={vi.fn()} />);
    await user.type(screen.getByLabelText(/search this website/i), "Achampet");
    await waitFor(() => expect(screen.getByRole("group", { name: "Institutions" })).toBeInTheDocument());
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GlobalSearchDialog open onClose={vi.fn()} />);
    await user.type(screen.getByLabelText(/search this website/i), "zzzznothing");
    await waitFor(() => expect(screen.getByText(/no matches for/i)).toBeInTheDocument());
  });

  it("announces the result count to screen readers", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GlobalSearchDialog open onClose={vi.fn()} />);
    await user.type(screen.getByLabelText(/search this website/i), "school");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/results found/i));
  });

  it("closes when a result is chosen", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<GlobalSearchDialog open onClose={onClose} />);
    await user.type(screen.getByLabelText(/search this website/i), "Achampet");
    const option = await screen.findAllByRole("option");
    const result = option.find((element) => element.textContent?.includes("Achampet"));
    if (result) await user.click(result);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
