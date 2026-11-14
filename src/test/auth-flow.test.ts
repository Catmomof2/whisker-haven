import { describe, expect, it } from "vitest";
import { confirmationUrl } from "@/lib/auth-flow";

describe("Email confirmation destinations", () => {
  it("returns rescue signup to the public confirmation page", () => {
    expect(confirmationUrl()).toBe("https://purrposeful-shelter-hub.lovable.app/auth/confirm");
  });
  it("preserves the staff invitation during confirmation", () => {
    const token = "11111111-1111-4111-8111-111111111111";
    expect(new URL(confirmationUrl(token)).searchParams.get("invite")).toBe(token);
  });
});