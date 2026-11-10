import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: member } = await supabase.from("shelter_members").select("id").eq("user_id", data.user.id).maybeSingle();
    if (!member) throw redirect({ to: "/auth", search: { denied: true } });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
