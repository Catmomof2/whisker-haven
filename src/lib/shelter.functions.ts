import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateResponse } from "@lovable.dev/ai-gateway";
import { requireStaff } from "@/lib/staff";

const bioInput = z.object({
  name: z.string().max(100),
  traits: z.string().max(3000),
});

export const generateBio = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => bioInput.parse(d))
  .handler(async ({ data }) => {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      input: [
        {
          role: "user",
          content: `You write warm, honest adoption bios for adult rescue cats. Using these intake traits and health notes, write JSON with keys "bio" (2 short paragraphs, ~110 words, mention needs honestly but positively) and "caption" (one upbeat social caption under 220 chars with 2-3 hashtags). Return JSON only.\n\nCat: ${data.name}\n${data.traits}`,
        },
      ],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any;
    let text: string = r.output_text ?? "";
    if (!text && Array.isArray(r.output)) {
      for (const o of r.output)
        for (const c of o.content ?? []) if (c.type === "output_text") text += c.text;
    }
    const m = text.match(/\{[\s\S]*\}/);
    try {
      const j = JSON.parse(m ? m[0] : text);
      return { bio: String(j.bio ?? ""), caption: String(j.caption ?? "") };
    } catch {
      return { bio: text, caption: "" };
    }
  });

const appInput = z.object({
  slug: z.string().min(1).max(100), cat_id: z.string().uuid(),
  applicant_name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(200),
  phone: z.string().max(40).default(""), home_type: z.string().max(120).default(""),
  other_pets: z.string().max(300).default(""), message: z.string().max(2000).default(""),
});
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export const submitApplication = createServerFn({ method: "POST" }).inputValidator((d) => appInput.parse(d))
  .handler(async ({ data }) => {
    const { publicClient } = await import("@/lib/public-client.server");
    const { data: id, error } = await publicClient().rpc("submit_public_application", {
      _slug: data.slug, _cat: data.cat_id, _name: data.applicant_name, _email: data.email,
      _phone: data.phone, _home: data.home_type, _pets: data.other_pets, _message: data.message,
    });
    if (error || !id) throw new Error("This cat is no longer available or the application could not be saved");
    // Submission is already committed: an email failure must not invite duplicate applications.
    let emailStatus = "not sent";
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: shelter } = await supabaseAdmin.from("shelters").select("id,name").eq("slug", data.slug).single();
      if (shelter) {
        const { data: settings } = await supabaseAdmin.from("shelter_settings").select("staff_email").eq("shelter_id", shelter.id).single();
        const { data: cat } = await supabaseAdmin.from("cats").select("name").eq("id", data.cat_id).eq("shelter_id", shelter.id).single();
        if (settings?.staff_email) {
          const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env['LOVABLE_API_KEY']}`, "X-Connection-Api-Key": process.env['RESEND_API_KEY'] ?? "" },
            body: JSON.stringify({ from: `${shelter.name.replace(/[<>\r\n]/g, "")} <onboarding@resend.dev>`, to: [settings.staff_email], subject: `New adoption application: ${cat?.name ?? "Cat"}`, html: `<h2>New application for ${esc(cat?.name ?? "Cat")}</h2><p>${esc(data.applicant_name)} — ${esc(data.email)}</p><p>${esc(data.message)}</p>` }),
          });
          emailStatus = res.ok ? "sent" : "not sent";
        }
      }
    } catch { console.error("Adoption saved; notification unavailable"); }
    return { id, emailStatus };
  });

const publicPage = z.object({
  shelter: z.object({ id: z.string().uuid(), name: z.string(), slug: z.string() }),
  cats: z.array(z.object({ id: z.string().uuid(), name: z.string(), photo_url: z.string().nullable(), breed: z.string().nullable(), color: z.string().nullable(), age_years: z.number().nullable(), sex: z.string().nullable(), temperament: z.string().nullable(), bio: z.string().nullable() })),
});
export const listAdoptableCats = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { publicClient } = await import("@/lib/public-client.server");
    const { data: page, error } = await publicClient().rpc("public_adoption_page", { _slug: data.slug });
    if (error) throw new Error("Could not load rescue");
    return page ? publicPage.parse(page) : null;
  });
