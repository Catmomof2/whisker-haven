import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { listAdoptableCats, submitApplication } from "@/lib/shelter.functions";
import { CatAvatar } from "@/components/AppShell";

const adoptQuery = (slug: string) => ({ queryKey: ["adoptable", slug], queryFn: () => listAdoptableCats({ data: { slug } }) });
type PublicCat = NonNullable<Awaited<ReturnType<typeof listAdoptableCats>>>["cats"][number];

export const Route = createFileRoute("/adopt/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ rescue: typeof s["rescue"] === "string" ? s["rescue"] : "whisker-haven" }),
  loaderDeps: ({ search }) => ({ slug: search.rescue }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adoptQuery(deps.slug)),
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

function ageLabel(age: number | null): string | null {
  if (age == null) return null;
  if (age < 1) return "Kitten";
  if (age === 1) return "1 year old";
  return `${age} years old`;
}

function AdoptDetail() {
  const { id } = Route.useParams();
  const { rescue } = Route.useSearch();
  const { data: page } = useSuspenseQuery(adoptQuery(rescue));
  const cat = page?.cats.find((c) => c.id === id);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState("");

  // Only cats on the public adoption page are shown. A missing id, or a
  // guessed id for a cat that isn't adoptable, gets this same page.
  if (!page || !cat) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
        <div className="space-y-4 px-5 pt-8">
          <Link to="/adopt" search={{ rescue }} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Adopt</Link>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-display text-xl font-semibold">This cat isn&apos;t available right now</p>
            <p className="mt-1 text-sm text-muted-foreground">They may have found a home already, or still be getting ready. Have a look at the other cats waiting for theirs.</p>
            <Link to="/adopt" search={{ rescue }} className="mt-4 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">See available cats</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <div className="space-y-4 px-5 pt-8">
        <Link to="/adopt" search={{ rescue }} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Adopt</Link>

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
      </div>
      {open && <ApplyForm slug={rescue} cat={cat} onClose={() => setOpen(false)} onSent={(email) => { setSentTo(email); setSubmitted(true); }} />}
    </div>
  );
}

function ApplyForm({ slug, cat, onClose, onSent }: { slug: string; cat: PublicCat; onClose: () => void; onSent: (email: string) => void }) {
  const submit = useServerFn(submitApplication);
  const [f, setF] = useState({ applicant_name: "", email: "", phone: "", home_type: "", other_pets: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const input = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: { ...f, slug, cat_id: cat.id } });
      onSent(f.email);
      onClose();
    } catch {
      toast.error("Couldn't send your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">Apply for {cat.name}</h3>
          <Button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={send} className="space-y-3">
          <input className={input} required placeholder="Your name" value={f.applicant_name} onChange={set("applicant_name")} />
          <input className={input} required type="email" placeholder="Email" value={f.email} onChange={set("email")} />
          <input className={input} placeholder="Phone" value={f.phone} onChange={set("phone")} />
          <input className={input} placeholder="Home type (house, apartment…)" value={f.home_type} onChange={set("home_type")} />
          <input className={input} placeholder="Other pets at home" value={f.other_pets} onChange={set("other_pets")} />
          <textarea className={input} rows={3} placeholder={`Why ${cat.name}?`} value={f.message} onChange={set("message")} />
          <Button disabled={busy} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {busy ? "Sending…" : "Send application"}
          </Button>
        </form>
      </div>
    </div>
  );
}
