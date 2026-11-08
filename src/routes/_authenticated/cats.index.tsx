import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Kanban } from "lucide-react";
import { PageHeader, StageBadge, CatAvatar } from "@/components/AppShell";
import { catsQuery, STAGES } from "@/lib/shelter";

export const Route = createFileRoute("/_authenticated/cats/")({
  head: () => ({
    meta: [
      { title: "Cats — Whisker Haven Shelter" },
      { name: "description", content: "Browse every cat in care with status, tags, and health notes." },
      { property: "og:title", content: "Cats — Whisker Haven Shelter" },
      { property: "og:description", content: "Browse every cat in care with status, tags, and health notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatsList,
});

function CatsList() {
  const { data: cats = [], isLoading } = useQuery(catsQuery);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const list = cats.filter(
    (c) =>
      (stage === "all" || c.stage === stage) &&
      `${c.name} ${c.breed} ${c.color} ${c.microchip_id} ${c.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        title="Cats"
        subtitle={`${cats.length} profiles`}
        action={
          <div className="flex gap-2">
            <Link to="/board" aria-label="Workflow board" className="rounded-xl border border-border bg-card p-2.5"><Kanban className="h-5 w-5" /></Link>
            <Link to="/cats/new" aria-label="New intake" className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-soft"><Plus className="h-5 w-5" /></Link>
          </div>
        }
      />
      <div className="space-y-3 px-5">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, chip, tag…" className="w-full bg-transparent py-3 text-sm outline-none" />
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {[{ id: "all", label: "All" }, ...STAGES].map((s) => (
            <button key={s.id} onClick={() => setStage(s.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${stage === s.id ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
              {s.label}
            </button>
          ))}
        </div>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {list.map((c) => (
          <Link key={c.id} to="/cats/$id" params={{ id: c.id }} className="flex gap-3 rounded-xl border border-border bg-card p-3">
            <CatAvatar src={c.photo_url} name={c.name} className="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{c.name}</p>
                <StageBadge stage={c.stage} priority={c.priority} />
              </div>
              <p className="text-xs text-muted-foreground">{[c.color, c.breed, c.age_years && `${c.age_years} yrs`].filter(Boolean).join(" · ")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {c.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{t}</span>)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
