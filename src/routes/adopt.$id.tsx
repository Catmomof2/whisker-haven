import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { catsQuery } from "@/lib/shelter";
import { CatAvatar } from "@/components/AppShell";
import { submitApplication } from "@/lib/shelter.functions";

export const Route = createFileRoute("/adopt/$id")({
  head: () => ({
    meta: [
      { title: "Meet a cat — Whisker Haven Shelter" },
      { name: "description", content: "Meet a cat looking for a home and start an adoption application." },
      { property: "og:title", content: "Meet a cat — Whisker Haven Shelter" },
      { property: "og:description", content: "Meet a cat looking for a home and start an adoption application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdoptDetail,
});

const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function ageLabel(age: number | null): string | null {
  if (age == null) return null;
  if (age < 1) return "Kitten";
  if (age === 1) return "1 year old";
  return `${age} years old`;
}

function AdoptDetail() {
  const { id } = Route.useParams();
  const { data: cats } = useQuery(catsQuery);
  const cat = cats?.find((c) => c.id === id);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitApplication);
  const blank = { applicant_name: "", email: "", phone: "", home_type: "", other_pets: "", message: "" };
  const [f, setF] = useState(blank);

  if (!cats) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  // Only cats in the "available" stage are shown to adopters. Anything else
  // (including a guessed id for a cat in another stage) gets this same page.
  if (!cat || cat.stage !== "available") {
    return (
      <div className="space-y-4 px-5 pt-6">
        <Link to="/adopt" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Adopt</Link>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-display text-xl font-semibold">This cat isn&apos;t available right now</p>
          <p className="mt-1 text-sm text-muted-foreground">They may have found a home already, or still be getting ready. Have a look at the other cats waiting for theirs.</p>
          <Link to="/adopt" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">See available cats</Link>
        </div>
      </div>
    );
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await submit({ data: { ...f, cat_id: cat!.id } });
      toast.success(r.emailStatus === "sent" ? "Application submitted · staff notified by email" : "Application submitted");
      setSentTo(f.email);
      setF(blank);
      setOpen(false);
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 px-5 pt-6">
      <Link to="/adopt" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Adopt</Link>

      <div className="flex items-center gap-4">
        <CatAvatar src={cat.photo_url} name={cat.name} className="h-28 w-28" />
        <div>
          <h1 className="font-display text-3xl font-semibold">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[cat.breed, cat.color, ageLabel(cat.age_years), cat.sex].filter(Boolean).join(" · ")}
          </p>
          {cat.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {cat.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      {cat.temperament && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-bold">Personality</h2>
          <p className="mt-1 text-sm">{cat.temperament}</p>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-bold">About {cat.name}</h2>
        {cat.bio ? (
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{cat.bio}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{cat.name} is still waiting on a bio — ask the shelter about them when you apply.</p>
        )}
      </section>

      {submitted ? (
        <div className="flex gap-3 rounded-xl bg-available p-4 text-available-foreground">
          <Check className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Application sent — thank you!</p>
            <p className="mt-0.5 text-sm">Your application for {cat.name} is in. The shelter will be in touch at {sentTo}.</p>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-soft">
          Start my application for {cat.name}
        </button>
      )}

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Applications go straight to the shelter team, who will be in touch about next steps and a meet &amp; greet.
      </p>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/40" onClick={() => setOpen(false)}>
          <div className="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Apply to adopt {cat.name}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={send} className="space-y-3">
              <input required className={field} placeholder="Full name" value={f.applicant_name} onChange={(e) => setF({ ...f, applicant_name: e.target.value })} />
              <input required type="email" className={field} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <input className={field} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              <input className={field} placeholder="Home type (apartment, house…)" value={f.home_type} onChange={(e) => setF({ ...f, home_type: e.target.value })} />
              <input className={field} placeholder="Other pets" value={f.other_pets} onChange={(e) => setF({ ...f, other_pets: e.target.value })} />
              <textarea rows={3} className={field} placeholder={`Why ${cat.name}?`} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Submitting…" : "Submit application"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
