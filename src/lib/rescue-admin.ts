import { z } from "zod";

export const rescueDetailsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(200),
  contact_phone: z.string().trim().max(40),
  adoption_heading: z.string().trim().min(1).max(160),
  adoption_intro: z.string().trim().max(2000),
  adoption_process: z.string().trim().max(4000),
});

export function requireRescueOwner(role: string) {
  if (role !== "owner") throw new Error("Only the rescue owner can edit shelter details");
}