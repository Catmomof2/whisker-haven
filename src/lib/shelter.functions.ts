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
  cat_id: z.string().uuid().nullable(),
  applicant_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().max(40).optional().default(""),
  home_type: z.string().max(120).optional().default(""),
  other_pets: z.string().max(300).optional().default(""),
  message: z.string().max(2000).optional().default(""),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d) => appInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("applications")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    let catName = "Any cat";
    if (data.cat_id) {
      const { data: c } = await supabaseAdmin.from("cats").select("name").eq("id", data.cat_id).single();
      if (c) catName = c.name;
    }
    const { data: s } = await supabaseAdmin.from("settings").select("staff_email").eq("id", 1).single();
    const to = s?.staff_email;
    let emailStatus = "skipped: no staff email set";
    if (to) {
      const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env['LOVABLE_API_KEY']}`,
          "X-Connection-Api-Key": process.env['RESEND_API_KEY'] ?? "",
        },
        body: JSON.stringify({
          from: "Whisker Haven <onboarding@resend.dev>",
          to: [to],
          subject: `New adoption application: ${catName}`,
          html: `<h2>New application for ${esc(catName)}</h2>
<p><b>Name:</b> ${esc(data.applicant_name)}<br/><b>Email:</b> ${esc(data.email)}<br/><b>Phone:</b> ${esc(data.phone)}<br/><b>Home:</b> ${esc(data.home_type)}<br/><b>Other pets:</b> ${esc(data.other_pets)}</p><p>${esc(data.message)}</p>`,
        }),
      });
      if (res.ok) emailStatus = "sent";
      else {
        const body = await res.text();
        console.error(`Resend failed [${res.status}]: ${body}`);
        emailStatus = `failed [${res.status}]: ${body.slice(0, 200)}`;
      }
    }
    return { id: row.id, emailStatus };
  });

// Public: only adoptable cats, only safe display fields.
export const listAdoptableCats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("cats")
    .select("id, name, photo_url, breed, color, age_years, sex, temperament, bio")
    .eq("stage", "available")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    throw new Error("Could not load cats");
  }
  return data ?? [];
});
