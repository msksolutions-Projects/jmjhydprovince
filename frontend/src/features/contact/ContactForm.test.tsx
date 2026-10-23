import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import { renderWithProviders } from "@/test/utils";

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/full name/i), "Mary Joseph");
  await user.type(screen.getByLabelText(/^email/i), "mary@example.com");
  await user.type(screen.getByLabelText(/subject/i), "Admission enquiry");
  await user.type(
    screen.getByLabelText(/message/i),
    "I would like to ask about admissions for the coming academic year, please.",
  );
  await user.click(screen.getByRole("checkbox"));
};

describe("ContactForm", () => {
  it("reports validation errors instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/please enter your full name/i)).toBeInTheDocument();
  });

  it("rejects an invalid email address", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await user.type(screen.getByLabelText(/^email/i), "nope");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
  });

  it("requires consent before sending", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await user.type(screen.getByLabelText(/full name/i), "Mary Joseph");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/please confirm before sending/i)).toBeInTheDocument();
  });

  it("shows a success message with a reference after sending", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(screen.getByText(/message sent/i)).toBeInTheDocument(), {
      timeout: 4000,
    });
  });

  it("surfaces a failure without losing the visitor's input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await user.type(screen.getByLabelText(/full name/i), "Mary Joseph");
    await user.type(screen.getByLabelText(/^email/i), "fail@example.invalid");
    await user.type(screen.getByLabelText(/subject/i), "Testing failure");
    await user.type(
      screen.getByLabelText(/message/i),
      "This submission is expected to fail so the error path can be verified.",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(screen.getByText(/message not sent/i)).toBeInTheDocument(), {
      timeout: 4000,
    });
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Mary Joseph");
  });
});
