import { describe, expect, it } from "vitest";
import { requireRescueOwner, rescueDetailsSchema } from "@/lib/rescue-admin";

describe("Rescue admin", () => {
  it("allows the rescue owner to edit shelter details", () => {
    expect(() => requireRescueOwner("owner")).not.toThrow();
  });
  it("prevents staff from changing owner-managed shelter details", () => {
    expect(() => requireRescueOwner("staff")).toThrow();
  });
  it("does not accept a client-selected shelter or adoption link", () => {
    const parsed = rescueDetailsSchema.parse({ name: "Test Rescue", location: "", contact_phone: "", adoption_heading: "Adopt", adoption_intro: "", adoption_process: "", id: "another-rescue", slug: "another-link" });
    expect(parsed).not.toHaveProperty("id");
    expect(parsed).not.toHaveProperty("slug");
  });
});