import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { updateCat } from "@/lib/data.functions";
import { catsQuery, STAGES, type Cat } from "@/lib/shelter";
import { CatAvatar } from "@/components/AppShell";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Workflow Board — Whisker Haven Shelter" },
      { name: "description", content: "Move cats through intake, medical hold, adoption, and foster stages." },
      { property: "og:title", content: "Workflow Board — Whisker Haven Shelter" },
      { property: "og:description", content: "Move cats through intake, medical hold, adoption, and foster stages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Board,
});

function Board() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(catsQuery);
  const [dragId, setDragId] = useState<string | null>(null);

  async function move(cat: Cat, stage: string) {
    qc.setQueryData<Cat[]>(["cats"], (old) => old?.map((c) => (c.id === cat.id ? { ...c, stage } : c)));
    await updateCat({ data: { id: cat.id, patch: { stage: stage as "intake" } } });
    qc.invalidateQueries({ queryKey: ["cats"] });
  }
  const shift = (cat: Cat, dir: number) => {
    const i = STAGES.findIndex((s) => s.id === cat.stage);
    const n = STAGES[i + dir];
    if (n) move(cat, n.id);
  };

  return (
    <div className="pt-6">
      <div className="px-5">
        <Link to="/cats" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Cats</Link>
        <h1 className="mt-1 font-display text-3xl font-semibold">Workflow board</h1>
        <p className="text-sm text-muted-foreground">Drag cards or tap arrows to move stages.</p>
      </div>
      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4">
        {STAGES.map((s) => {
          const list = cats.filter((c) => c.stage === s.id);
          return (
            <div
              key={s.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { const c = cats.find((x) => x.id === dragId); if (c) move(c, s.id); setDragId(null); }}
              className="w-[78%] shrink-0 snap-center rounded-xl bg-secondary/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.badge}`}>{s.label}</span>
                <span className="text-xs font-bold text-muted-foreground">{list.length}</span>
              </div>
              <div className="min-h-40 space-y-2">
                {list.map((c) => (
                  <div key={c.id} draggable onDragStart={() => setDragId(c.id)} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5">
                    <CatAvatar src={c.photo_url} name={c.name} className="h-10 w-10" />
                    <Link to="/cats/$id" params={{ id: c.id }} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{c.name}{c.priority && <span className="ml-1 text-intake-foreground">●</span>}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{c.health_notes}</p>
                    </Link>
                    <button aria-label="Previous stage" onClick={() => shift(c, -1)} className="rounded-lg bg-muted p-1.5"><ChevronLeft className="h-4 w-4" /></button>
                    <button aria-label="Next stage" onClick={() => shift(c, 1)} className="rounded-lg bg-primary p-1.5 text-primary-foreground"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
