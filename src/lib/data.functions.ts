import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireStaff } from "@/lib/staff";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Every operational query runs as the verified member under rescue-scoped RLS.
const fail = (e: { message: string } | null) => {
  if (e) {
    console.error(e);
    throw new Error("Database request failed");
  }
};

const STAGE = z.enum(["intake", "medical", "available", "foster", "adopted"]);
const s = (n: number) => z.string().max(n);
const photo = z.string().max(2_000_000).regex(/^data:image\/(jpeg|png|webp);base64,/).nullable();

const catFields = z.object({
  name: s(100).trim().min(1),
  photo_url: photo.optional(),
  microchip_id: s(50).nullable().optional(),
  color: s(80).nullable().optional(),
  breed: s(80).nullable().optional(),
  tags: z.array(s(40)).max(20).optional(),
  age_years: z.number().min(0).max(40).nullable().optional(),
  sex: s(20).nullable().optional(),
  temperament: s(300).nullable().optional(),
  health_notes: s(2000).nullable().optional(),
  intake_location: s(200).nullable().optional(),
  priority: z.boolean().optional(),
  stage: STAGE.optional(),
  spay_neuter: z.boolean().optional(),
  vaccinations: s(1000).nullable().optional(),
  medications: s(1000).nullable().optional(),
  diet: s(500).nullable().optional(),
  bio: s(4000).nullable().optional(),
  caption: s(1000).nullable().optional(),
});

export const listCats = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("cats").select("*").order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
});

export const createCat = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => catFields.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("cats").insert({ ...data, shelter_id: context.shelterId, stage: "intake" } as TablesInsert<"cats">).select("id").single();
    fail(error);
    if (!row) throw new Error("Could not create cat");
    return { id: row.id };
  });

export const updateCat = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ id: z.string().uuid(), patch: catFields.partial() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("cats").update(data.patch as TablesUpdate<"cats">).eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const listVetLogs = createServerFn({ method: "GET" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ cat_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from("vet_logs").select("*").eq("cat_id", data.cat_id).order("visit_date", { ascending: false });
    fail(error);
    return rows ?? [];
  });

export const addVetLog = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ cat_id: z.string().uuid(), visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: s(1000).trim().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("vet_logs").insert({ ...data, shelter_id: context.shelterId });
    fail(error);
    return { ok: true };
  });

export const listTasks = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("tasks").select("*").order("created_at");
  fail(error);
  return data ?? [];
});

export const addTask = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ title: s(200).trim().min(1), category: z.enum(["feeding", "medication", "cleaning"]), time_slot: s(30).nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").insert({ ...data, shelter_id: context.shelterId });
    fail(error);
    return { ok: true };
  });

export const setTaskDone = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ id: z.string().uuid(), done: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").update({ done: data.done }).eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const resetTasks = createServerFn({ method: "POST" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { error } = await context.supabase.from("tasks").update({ done: false }).eq("done", true);
  fail(error);
  return { ok: true };
});

export const listApplications = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("applications").select("*").order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
});

export const setApplicationStatus = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "approved", "declined"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: app, error } = await db.from("applications").update({ status: data.status }).eq("id", data.id).select("cat_id").single();
    fail(error);
    if (data.status === "approved" && app?.cat_id) {
      const { error: e2 } = await db.from("cats").update({ stage: "adopted" }).eq("id", app.cat_id);
      fail(e2);
    }
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("shelter_settings").select("*").eq("shelter_id", context.shelterId).single();
  fail(error);
  if (!data) throw new Error("Settings unavailable");
  return data;
});

export const saveSettings = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ staff_email: z.string().trim().email().max(200).nullable(), capacity: z.number().int().min(1).max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("shelter_settings").update(data).eq("shelter_id", context.shelterId);
    fail(error);
    return { ok: true };
  });

export const createStaffApplication = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ cat_id: z.string().uuid().nullable(), applicant_name: s(120).trim().min(1), email: z.string().trim().email().max(200), phone: s(40), home_type: s(120), other_pets: s(300), message: s(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").insert({ ...data, shelter_id: context.shelterId });
    fail(error);
    return { ok: true };
  });
