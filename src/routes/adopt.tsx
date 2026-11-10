import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Heart, Search, X } from "lucide-react";
import { listAdoptableCats, submitApplication } from "@/lib/shelter.functions";
import { CatAvatar } from "@/components/AppShell";

const adoptQuery = (slug: string) => ({ queryKey: ["adoptable", slug], queryFn: () => listAdoptableCats({ data: { slug } }) });
type PublicCat = NonNullable<Awaited<ReturnType<typeof listAdoptableCats>>>["cats"][number];

export const Route = createFileRoute("/adopt")({
  validateSearch: (s: Record<string, unknown>) => ({ rescue: typeof s["rescue"] === "string" ? s["rescue"] : "whisker-haven" }),
  loaderDeps: ({ search }) => ({ slug: search.rescue }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adoptQuery(deps.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Adopt a cat — ${loaderData?.shelter.name ?? "Cat Rescue"}` },
      { name: "description", content: `Meet available adult cats at ${loaderData?.shelter.name ?? "this rescue"} and apply to adopt.` },
      { property: "og:title", content: `Adopt a cat — ${loaderData?.shelter.name ?? "Cat Rescue"}` },
      { property: "og:description", content: `Meet available adult cats at ${loaderData?.shelter.name ?? "this rescue"} and apply to adopt.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdoptPage,
});

type AgeGroup = "all" | "kitten" | "young" | "adult" | "senior";

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: "all", label: "All ages" },
  { id: "kitten", label: "Kitten" },
  { id: "young", label: "Young" },
  { id: "adult", label: "Adult" },
  { id: "senior", label: "Senior" },
];

function ageGroupOf(age: number | null): AgeGroup | null {
  if (age == null) return null;
  if (age < 1) return "kitten";
  if (age <= 2) return "young";
  if (age <= 6) return "adult";
  return "senior";
}

function AdoptPage() {
  const { rescue } = Route.useSearch();
  const { data: page } = useSuspenseQuery(adoptQuery(rescue));
  const cats = page?.cats ?? [];
  const [applyFor, setApplyFor] = useState<PublicCat | null>(null);
  const [q, setQ] = useState("");
  const [age, setAge] = useState<AgeGroup>("all");

  const list = cats.filter((c) => {
    if (age !== "all" && ageGroupOf(c.age_years) !== age) return false;
    if (q.trim()) {
      const hay = `${c.name} ${c.breed ?? ""} ${c.color ?? ""} ${c.temperament ?? ""}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <header className="px-5 pb-4 pt-8">
        <h1 className="font-display text-3xl font-semibold">{page?.shelter.name ?? "Rescue not found"}</h1>
        <p className="mt-2 text-lg font-semibold">Adult cats looking for home</p>
        <p className="mt-2 text-sm text-muted-foreground">Grown-up cats with settled personalities. Find your match and apply in two minutes.</p>
      </header>
      <div className="space-y-4 px-5">
        {!page && <p>This rescue link is not available.</p>}
        {page && cats.length === 0 && <p className="rounded-xl bg-card p-5 text-sm">No cats are available right now — check back soon!</p>}
        {page && cats.length > 0 && (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, breed…" className="w-full bg-transparent py-3 text-sm outline-none" />
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {AGE_GROUPS.map((g) => (
                <button key={g.id} onClick={() => setAge(g.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${age === g.id ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
                  {g.label}
                </button>
              ))}
            </div>
            {list.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No cats match those filters. Try clearing a filter or two.</p>
            )}
          </>
        )}
        {list.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            {c.photo_url ? (
              <img src={c.photo_url} alt={c.name} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-warm"><CatAvatar src={null} name={c.name} className="h-20 w-20" /></div>
            )}
            <div className="p-4">
              <h2 className="font-display text-2xl font-semibold">{c.name}</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                {[c.age_years != null && `${c.age_years} yrs`, c.sex, c.breed, c.color].filter(Boolean).join(" · ")}
              </p>
              {c.bio ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{c.bio}</p> : c.temperament && <p className="mt-3 text-sm">{c.temperament}</p>}
              <Link to="/adopt/$id" params={{ id: c.id }} search={{ rescue }} className="mt-3 inline-block text-sm font-semibold text-primary">
                See {c.name}&apos;s full profile →
              </Link>
              <Button onClick={() => setApplyFor(c)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
                <Heart className="h-4 w-4" /> Apply to adopt {c.name}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground"><Link to="/auth" search={{}} className="font-semibold">Staff sign-in</Link></p>
      {applyFor && <ApplyForm slug={rescue} cat={applyFor} onClose={() => setApplyFor(null)} />}
    </div>
  );
}

function ApplyForm({ slug, cat, onClose }: { slug: string; cat: PublicCat; onClose: () => void }) {
  const submit = useServerFn(submitApplication);
  const [f, setF] = useState({ applicant_name: "", email: "", phone: "", home_type: "", other_pets: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const input = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: { ...f, slug, cat_id: cat.id } });
      setDone(true);
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
        {done ? (
          <div className="space-y-4 text-sm">
            <p>Thank you! Our team has your application and will be in touch soon.</p>
            <Button onClick={onClose} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Done</Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
