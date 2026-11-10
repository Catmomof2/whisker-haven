import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, CatAvatar } from "@/components/AppShell";
import { catsQuery, type Cat } from "@/lib/shelter";

export const Route = createFileRoute("/adopt")({
  head: () => ({
    meta: [
      { title: "Adopt — Whisker Haven Shelter" },
      { name: "description", content: "Meet the cats looking for a home and start an adoption application." },
      { property: "og:title", content: "Adopt — Whisker Haven Shelter" },
      { property: "og:description", content: "Meet the cats looking for a home and start an adoption application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdoptList,
});

type AgeGroup = "all" | "kitten" | "young" | "adult" | "senior";

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: "all", label: "All ages" },
  { id: "kitten", label: "Kitten" },
  { id: "young", label: "Young" },
  { id: "adult", label: "Adult" },
  { id: "senior", label: "Senior" },
];

function ageGroupOf(cat: Cat): AgeGroup | null {
  if (cat.age_years == null) return null;
  if (cat.age_years < 1) return "kitten";
  if (cat.age_years <= 2) return "young";
  if (cat.age_years <= 6) return "adult";
  return "senior";
}

function ageLabel(cat: Cat): string | null {
  if (cat.age_years == null) return null;
  if (cat.age_years < 1) return "Kitten";
  if (cat.age_years === 1) return "1 yr";
  return `${cat.age_years} yrs`;
}

function AdoptList() {
  const { data: cats = [], isLoading } = useQuery(catsQuery);
  const [q, setQ] = useState("");
  const [age, setAge] = useState<AgeGroup>("all");
  const [tag, setTag] = useState("all");

  // Only cats in the "available" stage are shown to adopters.
  const available = cats.filter((c) => c.stage === "available");
  const tags = [...new Set(available.flatMap((c) => c.tags))].sort();

  const list = available.filter((c) => {
    if (age !== "all" && ageGroupOf(c) !== age) return false;
    if (tag !== "all" && !c.tags.includes(tag)) return false;
    if (q.trim()) {
      const hay = `${c.name} ${c.breed ?? ""} ${c.color ?? ""} ${c.temperament ?? ""} ${c.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Adopt"
        subtitle={available.length === 0 ? "Find your new best friend" : `${available.length} ${available.length === 1 ? "cat" : "cats"} looking for a home`}
      />
      <div className="space-y-3 px-5">
        {available.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-display text-xl font-semibold">No cats available right now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every cat here has found a home or is still getting ready. Check back soon — new friends arrive all the time.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, breed, trait…" className="w-full bg-transparent py-3 text-sm outline-none" />
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {AGE_GROUPS.map((g) => (
                <button key={g.id} onClick={() => setAge(g.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${age === g.id ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
                  {g.label}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                <button onClick={() => setTag("all")} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${tag === "all" ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>All traits</button>
                {tags.map((t) => (
                  <button key={t} onClick={() => setTag(t)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${tag === t ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && list.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No cats match those filters. Try clearing a filter or two.</p>
            )}
            {list.map((c) => (
              <Link key={c.id} to="/adopt/$id" params={{ id: c.id }} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                <CatAvatar src={c.photo_url} name={c.name} className="h-20 w-20" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.breed, c.color, ageLabel(c), c.sex].filter(Boolean).join(" · ")}
                  </p>
                  {c.temperament && <p className="mt-1 line-clamp-1 text-sm">{c.temperament}</p>}
                  {c.bio && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.bio}</p>}
                  {c.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{t}</span>)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
