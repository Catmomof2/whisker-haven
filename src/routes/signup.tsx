import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your rescue — Whisker Haven" },
      { name: "description", content: "Set up your rescue's workspace on Whisker Haven — intake, medical care, adoptions, and daily tasks in one place." },
      { property: "og:title", content: "Create your rescue — Whisker Haven" },
      { property: "og:description", content: "Set up your rescue's workspace on Whisker Haven — intake, medical care, adoptions, and daily tasks in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [shelterName, setShelterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { shelter_name: shelterName.trim() },
        },
      });
      if (error) throw error;
      if (data.session) {
        qc.clear();
        navigate({ to: "/dashboard" });
      } else {
        setStep(2);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm";
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-background px-6">
      <h1 className="font-display text-3xl font-semibold">Create your rescue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set up your rescue&apos;s workspace — intake, medical care, adoptions, and daily tasks in one place. You&apos;ll be its owner, and you can invite staff later.</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {step} of 2 — {step === 1 ? "Your rescue" : "Confirm your email"}</p>
      {step === 2 ? (
        <div className="mt-6 rounded-xl bg-card p-4 text-sm">
          <p className="font-bold">Check your email to confirm your account, then sign in.</p>
          <p className="mt-2 text-muted-foreground">We sent a confirmation link to {email}. Once you&apos;ve confirmed, your rescue workspace will be ready.</p>
          <Link to="/auth" search={{}} className="mt-4 block text-center text-sm font-bold text-primary">Go to sign-in →</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className={input} required maxLength={100} aria-label="Rescue name" placeholder="Rescue name" value={shelterName} onChange={(e) => setShelterName(e.target.value)} />
          <input className={input} aria-label="Email" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} aria-label="Password" type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button disabled={busy} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60">
            {busy ? "Please wait…" : "Create rescue account"}
          </Button>
        </form>
      )}
      <Link to="/auth" search={{}} className="mt-8 text-center text-sm font-semibold text-muted-foreground">Already have an account? Sign in</Link>
      <Link to="/adopt" search={{ rescue: "whisker-haven" }} className="mt-3 text-center text-sm font-bold text-primary">Looking to adopt? Meet our cats →</Link>
    </div>
  );
}
