import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { InstitutionDetailPage } from "./InstitutionDetailPage";
import { renderWithProviders } from "@/test/utils";

describe("InstitutionDetailPage", () => {
  it("keeps the institution profile without displaying an unverified photograph", () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/institutions/:id" element={<InstitutionDetailPage />} />
      </Routes>,
      { initialEntries: ["/institutions/3"] },
    );

    expect(screen.getByRole("heading", { name: "JMJ Formation House, Bhopal" })).toBeInTheDocument();
    expect(screen.getByText("Institution details")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
