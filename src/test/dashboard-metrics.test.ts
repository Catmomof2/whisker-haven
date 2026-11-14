import { describe, expect, it } from "vitest";
import { monthlyAdoptions } from "@/lib/dashboard-metrics";

describe("Monthly adoption tracker", () => {
  it("counts adopted cats only within the current calendar month", () => {
    expect(monthlyAdoptions([
      { stage: "adopted", adopted_at: "2026-11-01T00:00:00Z" },
      { stage: "adopted", adopted_at: "2026-11-30T23:59:59Z" },
      { stage: "adopted", adopted_at: "2026-10-31T23:59:59Z" },
      { stage: "adopted", adopted_at: "2026-12-01T00:00:00Z" },
      { stage: "available", adopted_at: "2026-11-03T12:00:00Z" },
      { stage: "adopted", adopted_at: null },
    ], new Date("2026-11-14T08:01:00Z"))).toBe(2);
  });
});