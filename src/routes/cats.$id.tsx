import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Copy, Stethoscope, Save } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { catsQuery, STAGES, fileToDataUrl, type Cat } from "@/lib/shelter";
import { StageBadge, CatAvatar } from "@/components/AppShell";
import { generateBio } from "@/lib/shelter.functions";

export const Route = createFileRoute("/cats/$id")({
  head: () => ({
    meta: [
      { title: "Cat Profile — Whisker Haven Shelter" },
      { name: "description", content: "Cat profile with medical records and AI adoption bio." },
      { property: "og:title", content: "Cat Profile — Whisker Haven Shelter" },
      { property: "og:description", content: "Cat profile with medical records and AI adoption bio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatProfile,
});

const field = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const label = "mb-1 block text-xs font-bold text-muted-foreground";

function CatProfile() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: cats } = useQuery(catsQuery);
  const cat = cats?.find((c) => c.id === id);
  const [d, setD] = useState<Cat | null>(null);
  const [gen, setGen] = useState(false);
  const bioFn = useServerFn(generateBio);
  const logs = useQuery({
    queryKey: ["vet_logs", id],
    queryFn: async () => (await supabase.from("vet_logs").select("*").eq("cat_id", id).order("visit_date", { ascending: false })).data ?? [],
  });
  const [visit, setVisit] = useState({ visit_date: new Date().toISOString().slice(0, 10), note: "" });

  useEffect(() => { if (cat && !d) setD(cat); }, [cat, d]);
  if (!d) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  const up = (patch: Partial<Cat>) => setD({ ...d, ...patch });
  async function save(patch: Partial<Cat> = {}) {
    const next = { ...d!, ...patch };
    const { id: _i, created_at: _c, ...rest } = next;
    const { error } = await supabase.from("cats").update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    setD(next);
    qc.invalidateQueries({ queryKey: ["cats"] });
    toast.success("Saved");
  }
  async function runAI() {
    setGen(true);
    try {
      const traits = `Age: ${d!.age_years ?? "?"} yrs, ${d!.sex}. Color: ${d!.color}. Breed: ${d!.breed}. Tags: ${d!.tags.join(", ")}. Temperament: ${d!.temperament}. Health: ${d!.health_notes}. Spay/neuter: ${d!.spay_neuter ? "done" : "pending"}. Diet: ${d!.diet}. Meds: ${d!.medications}.`;
      const r = await bioFn({ data: { name: d!.name, traits } });
      up({ bio: r.bio, caption: r.caption });
      toast.success("Bio drafted — edit and save");
    } catch (e) {
      toast.error("Couldn't generate the bio. Please try again.");
      console.error(e);
    } finally { setGen(false); }
  }
  async function addVisit() {
    if (!visit.note.trim()) return;
    await supabase.from("vet_logs").insert({ cat_id: id, ...visit });
    setVisit({ ...visit, note: "" });
    logs.refetch();
  }

  return (
    <div className="space-y-4 px-5 pt-6">
      <Link to="/cats" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Cats</Link>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <CatAvatar src={d.photo_url} name={d.name} className="h-24 w-24" />
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) save({ photo_url: await fileToDataUrl(f) }); }} />
        </label>
        <div>
          <h1 className="font-display text-3xl font-semibold">{d.name}</h1>
          <p className="text-xs text-muted-foreground">Chip {d.microchip_id || "—"} · from {d.intake_location || "—"}</p>
          <div className="mt-1.5"><StageBadge stage={d.stage} priority={d.priority} /></div>
        </div>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
        {STAGES.map((s) => (
          <button key={s.id} onClick={() => save({ stage: s.id })} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${d.stage === s.id ? s.badge + " ring-2 ring-current" : "bg-secondary text-secondary-foreground"}`}>{s.label}</button>
        ))}
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Adoption bio</h2>
          <button onClick={runAI} disabled={gen} className="inline-flex items-center gap-1.5 rounded-xl bg-warm px-3 py-2 text-xs font-bold text-primary-foreground shadow-soft disabled:opacity-60">
            <Sparkles className="h-4 w-4" />{gen ? "Writing…" : "AI generate"}
          </button>
        </div>
        <textarea rows={7} className={field} value={d.bio ?? ""} onChange={(e) => up({ bio: e.target.value })} placeholder="Tap AI generate to draft a bio from intake traits." />
        <div>
          <div className="flex items-center justify-between"><span className={label}>Social caption</span>
            <button onClick={() => { navigator.clipboard.writeText(d.caption ?? ""); toast.success("Copied"); }} className="text-xs font-bold text-primary inline-flex items-center gap-1"><Copy className="h-3 w-3" />Copy</button>
          </div>
          <textarea rows={3} className={field} value={d.caption ?? ""} onChange={(e) => up({ caption: e.target.value })} />
        </div>
        <button onClick={() => save()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" />Save bio</button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-bold">Health & medical</h2>
        <label className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm font-semibold">
          Spayed / neutered
          <input type="checkbox" checked={d.spay_neuter} onChange={(e) => up({ spay_neuter: e.target.checked })} className="h-5 w-5 accent-primary" />
        </label>
        <div><span className={label}>Vaccinations</span><textarea rows={2} className={field} value={d.vaccinations ?? ""} onChange={(e) => up({ vaccinations: e.target.value })} /></div>
        <div><span className={label}>Daily medication schedule</span><textarea rows={2} className={field} value={d.medications ?? ""} onChange={(e) => up({ medications: e.target.value })} /></div>
        <div><span className={label}>Dietary needs</span><input className={field} value={d.diet ?? ""} onChange={(e) => up({ diet: e.target.value })} /></div>
        <div><span className={label}>Health notes</span><textarea rows={2} className={field} value={d.health_notes ?? ""} onChange={(e) => up({ health_notes: e.target.value })} /></div>
        <div><span className={label}>Tags</span><input className={field} value={d.tags.join(", ")} onChange={(e) => up({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
        <label className="flex items-center justify-between rounded-xl bg-intake p-3 text-sm font-semibold text-intake-foreground">
          Priority intake
          <input type="checkbox" checked={d.priority} onChange={(e) => up({ priority: e.target.checked })} className="h-5 w-5" />
        </label>
        <button onClick={() => save()} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">Save medical info</button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-bold"><Stethoscope className="h-4 w-4" />Vet appointments</h2>
        <div className="flex gap-2">
          <input type="date" className={field + " w-36"} value={visit.visit_date} onChange={(e) => setVisit({ ...visit, visit_date: e.target.value })} />
          <input className={field} placeholder="Visit note" value={visit.note} onChange={(e) => setVisit({ ...visit, note: e.target.value })} />
        </div>
        <button onClick={addVisit} className="w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground">Log visit</button>
        {(logs.data ?? []).map((l) => (
          <div key={l.id} className="border-l-2 border-primary pl-3">
            <p className="text-xs font-bold text-muted-foreground">{l.visit_date}</p>
            <p className="text-sm">{l.note}</p>
          </div>
        ))}
        {logs.data?.length === 0 && <p className="text-xs text-muted-foreground">No visits logged yet.</p>}
      </section>
    </div>
  );
}
