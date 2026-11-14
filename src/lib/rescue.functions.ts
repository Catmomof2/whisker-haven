import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireStaff } from "@/lib/staff";
import { confirmationUrl } from "@/lib/auth-flow";

export const getRescue = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("shelters").select("*").eq("id", context.shelterId).single();
  if (error || !data) throw new Error("Could not load rescue");
  return { ...data, role: context.shelterRole };
});
export const getTeam = createServerFn({ method: "GET" }).middleware([requireStaff]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("shelter_members").select("id,email,role").eq("shelter_id", context.shelterId);
  if (error) throw new Error("Could not load staff");
  return data ?? [];
});
export const inviteStaff = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ email: z.string().trim().email().max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    if (context.shelterRole !== "owner") throw new Error("Only the rescue owner can invite staff");
    const { data: invite, error } = await context.supabase.from("shelter_invites").insert({ shelter_id: context.shelterId, email: data.email.toLowerCase() }).select("token").single();
    if (error || !invite) throw new Error("Could not create invitation");
    // Use managed auth email so no unverified sender domain or temporary password is needed.
    const { publicClient } = await import("@/lib/public-client.server");
    const { error: sendError } = await publicClient().auth.signInWithOtp({
      email: data.email.toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: confirmationUrl(invite.token), data: { invite_token: invite.token } },
    });
    return { ...invite, emailSent: !sendError, emailError: sendError?.message ?? null };
  });
export const removeStaff = createServerFn({ method: "POST" }).middleware([requireStaff])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("remove_shelter_staff", { _member: data.id });
    if (error) throw new Error("Could not remove staff");
    return { ok: true };
  });