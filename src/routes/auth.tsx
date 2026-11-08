import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { denied?: boolean } => (s.denied ? { denied: true } : {}),
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
  const { denied } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
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
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (data.session) navigate({ to: "/" });
        else setSent(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  }

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm";
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-background px-6">
      <h1 className="font-display text-3xl font-semibold">Whisker Haven staff</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to manage cats, tasks and applications.</p>
      {denied && (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 text-sm">
          This account isn't on the staff list yet. Ask your shelter admin for access.{" "}
          <button onClick={signOut} className="font-bold text-primary">Sign out</button>
        </div>
      )}
      {sent ? (
        <p className="mt-6 rounded-xl bg-card p-4 text-sm">Check your email to confirm your account, then sign in.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm font-semibold text-muted-foreground">
            {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
        </form>
      )}
      <Link to="/adopt" className="mt-8 text-center text-sm font-bold text-primary">Looking to adopt? Meet our cats →</Link>
    </div>
  );
}
