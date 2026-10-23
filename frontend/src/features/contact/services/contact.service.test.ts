import { describe, expect, it } from "vitest";
import { contactSchema, sendContactMessage } from "./contact.service";

const valid = {
  fullName: "Mary Joseph",
  email: "mary@example.com",
  phone: "+91 40 2340 7670",
  subject: "Admission enquiry",
  message: "I would like to ask about admissions for the coming academic year, please.",
  consent: true as const,
};

describe("contactSchema", () => {
  it("accepts a complete submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a short message", () => {
    const result = contactSchema.safeParse({ ...valid, message: "Too short" });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("treats phone as optional", () => {
    const withoutPhone = { ...valid, phone: undefined };
    expect(contactSchema.safeParse(withoutPhone).success).toBe(true);
  });

  it("rejects a malformed phone number", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "abcdef" }).success).toBe(false);
  });
});

describe("sendContactMessage", () => {
  it("returns a reference from the mock transport", async () => {
    const result = await sendContactMessage(valid);
    expect(result.ok).toBe(true);
    expect(result.reference).toMatch(/^JMJ-/);
  });

  it("surfaces a failure message", async () => {
    await expect(
      sendContactMessage({ ...valid, email: "fail@example.invalid" }),
    ).rejects.toThrow(/could not send/i);
  });
});
