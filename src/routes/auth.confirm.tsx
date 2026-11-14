import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth_/confirm")({
  validateSearch: (s: Record<string, unknown>): { invite?: string } => ({ ...(typeof s["invite"] === "string" && /^[0-9a-f-]{36}$/i.test(s["invite"]) ? { invite: s["invite"] } : {}) }),
  head: () => ({ meta: [
    { title: "Confirm your rescue account — Whisker Haven" },
    { name: "description", content: "Confirm your email and finish joining your private rescue workspace." },
    { property: "og:title", content: "Confirm your rescue account — Whisker Haven" },
    { property: "og:description", content: "Finish joining your private rescue workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ConfirmAccount,
});

function ConfirmAccount() {
  const { invite } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function confirm() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("This confirmation link has expired or is incomplete. Request a new link from sign-in."); return; }
      const { data: shelterId, error: membershipError } = await supabase.rpc("my_shelter_id");
      if (membershipError) { setError("We couldn't check your rescue access. Please try again."); return; }
      if (!shelterId && invite) {
        const { error: joinError } = await supabase.rpc("accept_shelter_invite", { _token: invite });
        if (joinError) { setError(joinError.message); return; }
      } else if (!shelterId) { setError("Your email is confirmed. Sign in to finish creating your rescue."); return; }
      if (active) setReady(true);
    }
    void confirm();
    return () => { active = false; };
  }, [invite]);
  async function finish(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setBusy(false); return; }
    qc.clear(); await navigate({ to: "/team" });
  }
  return <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-background px-6">
    <h1 className="font-display text-3xl font-semibold">{ready ? "Email confirmed" : "Confirm your account"}</h1>
    {!ready && !error && <p role="status" className="mt-4 text-sm text-muted-foreground">Checking your confirmation…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {ready && <form onSubmit={finish} className="mt-6 space-y-4">
      <label className="block text-sm">Choose your password<input aria-label="New password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3" /></label>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Open my rescue"}</Button>
    </form>}
    <Link to="/auth" search={{}} className="mt-6 text-center text-sm font-semibold text-primary">Return to sign-in</Link>
  </div>;
}