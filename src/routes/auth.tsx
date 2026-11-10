import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { denied?: boolean; invite?: string } => ({ ...(s["denied"] ? { denied: true } : {}), ...(typeof s["invite"] === "string" ? { invite: s["invite"] } : {}) }),
  head: () => ({
    meta: [
      { title: "Staff sign-in — Whisker Haven" },
      { name: "description", content: "Sign in to manage Whisker Haven shelter operations." },
      { property: "og:title", content: "Staff sign-in — Whisker Haven" },
      { property: "og:description", content: "Sign in to manage Whisker Haven shelter operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { denied, invite } = Route.useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">(invite ? "up" : "in");
  const [shelterName, setShelterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (invite) {
          const { data: existing } = await supabase.rpc("my_shelter_id");
          if (!existing) { const { error: joinError } = await supabase.rpc("accept_shelter_invite", { _token: invite }); if (joinError) throw joinError; }
        }
        qc.clear();
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: invite ? { invite_token: invite } : { shelter_name: shelterName.trim() } } });
        if (error) throw error;
        if (data.session) { qc.clear(); navigate({ to: "/" }); }
        else setSent(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function createWorkspace() {
    const { error } = await supabase.rpc("create_my_shelter", { _name: shelterName });
    if (error) { toast.error(error.message); return; }
    qc.clear(); navigate({ to: "/" });
  }

  async function signOut() {
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  }

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm";
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-background px-6">
      <h1 className="font-display text-3xl font-semibold">Rescue staff</h1>
      <p className="mt-1 text-sm text-muted-foreground">{invite ? "Join your rescue team." : mode === "up" ? "Create your rescue’s workspace." : "Welcome back to your rescue."}</p>
      {denied && (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 text-sm">
          This account has no rescue yet.
          <input aria-label="Rescue name" placeholder="Rescue name" className={input + " mt-3"} value={shelterName} onChange={(e) => setShelterName(e.target.value)} />
          <Button onClick={createWorkspace} disabled={!shelterName.trim()} className="my-3 w-full">Create rescue</Button>
          <Button onClick={signOut} className="font-bold text-primary">Sign out</Button>
        </div>
      )}
      {sent ? (
        <p className="mt-6 rounded-xl bg-card p-4 text-sm">Check your email to confirm your account, then sign in.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "up" && !invite && <input className={input} required maxLength={100} aria-label="Rescue name" placeholder="Rescue name" value={shelterName} onChange={(e) => setShelterName(e.target.value)} />}
          <input className={input} aria-label="Email" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} aria-label="Password" type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button disabled={busy} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : invite ? "Join rescue" : "Create rescue account"}
          </Button>
          <Button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm font-semibold text-muted-foreground">
            {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
          </Button>
        </form>
      )}
      <Link to="/adopt" search={{ rescue: "whisker-haven" }} className="mt-8 text-center text-sm font-bold text-primary">Looking to adopt? Meet our cats →</Link>
    </div>
  );
}
