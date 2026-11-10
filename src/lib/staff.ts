import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Membership is resolved from the verified user, never a client-selected shelter.
export const requireStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.from("shelter_members").select("shelter_id, role").eq("user_id", context.userId).single();
    if (error || !data) throw new Error("Forbidden: rescue staff only");
    return next({ context: { shelterId: data.shelter_id, shelterRole: data.role } });
  });
