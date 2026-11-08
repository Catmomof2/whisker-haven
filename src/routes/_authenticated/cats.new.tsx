import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Camera, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createCat } from "@/lib/data.functions";
import { fileToDataUrl } from "@/lib/shelter";

export const Route = createFileRoute("/_authenticated/cats/new")({
  head: () => ({
    meta: [
      { title: "New Intake — Whisker Haven Shelter" },
      { name: "description", content: "Quick intake form for a newly arrived cat." },
      { property: "og:title", content: "New Intake — Whisker Haven Shelter" },
      { property: "og:description", content: "Quick intake form for a newly arrived cat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewIntake,
});

const field = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const label = "mb-1 block text-xs font-bold text-muted-foreground";

function NewIntake() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ name: "", microchip_id: "", color: "", breed: "", tags: "", age_years: "", sex: "Female", temperament: "", health_notes: "", intake_location: "", priority: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    let data: { id: string };
    try {
      data = await createCat({ data: {
        ...f,
        name: f.name.trim(),
        age_years: f.age_years ? Number(f.age_years) : null,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        photo_url: photo,
      } });
    } catch {
      setSaving(false);
      toast.error("Couldn't save. Check the fields and try again.");
      return;
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["cats"] });
    toast.success(`${f.name} checked in`);
    nav({ to: "/cats/$id", params: { id: data.id } });
  }

  return (
    <form onSubmit={save} className="space-y-4 px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/cats" className="rounded-xl p-1"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-2xl font-semibold">New intake</h1>
      </div>
      <label className="flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-card">
        {photo ? <img src={photo} alt="Preview" className="h-full w-full object-cover" /> : (
          <span className="flex flex-col items-center gap-1 text-sm font-semibold text-muted-foreground"><Camera className="h-7 w-7" />Add photo</span>
        )}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setPhoto(await fileToDataUrl(file)); }} />
      </label>
      <div><span className={label}>Name *</span><input className={field} value={f.name} onChange={set("name")} /></div>
      <div><span className={label}>Microchip ID</span><input className={field} value={f.microchip_id} onChange={set("microchip_id")} inputMode="numeric" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><span className={label}>Color</span><input className={field} value={f.color} onChange={set("color")} /></div>
        <div><span className={label}>Breed</span><input className={field} value={f.breed} onChange={set("breed")} /></div>
        <div><span className={label}>Age (years)</span><input className={field} value={f.age_years} onChange={set("age_years")} inputMode="decimal" /></div>
        <div><span className={label}>Sex</span><select className={field} value={f.sex} onChange={set("sex")}><option>Female</option><option>Male</option></select></div>
      </div>
      <div><span className={label}>Tags (comma separated)</span><input className={field} value={f.tags} onChange={set("tags")} placeholder="calm, lap cat, shy" /></div>
      <div><span className={label}>Temperament</span><input className={field} value={f.temperament} onChange={set("temperament")} /></div>
      <div><span className={label}>Health condition notes</span><textarea rows={3} className={field} value={f.health_notes} onChange={set("health_notes")} /></div>
      <div><span className={label}>Intake location</span><input className={field} value={f.intake_location} onChange={set("intake_location")} placeholder="e.g. Oak St colony" /></div>
      <label className="flex items-center gap-2 rounded-xl bg-intake p-3 text-sm font-bold text-intake-foreground">
        <input type="checkbox" checked={f.priority} onChange={(e) => setF({ ...f, priority: e.target.checked })} className="h-4 w-4 accent-current" />
        Priority intake (urgent care needed)
      </label>
      <button disabled={saving} className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-soft disabled:opacity-60">
        {saving ? "Saving…" : "Check in cat"}
      </button>
    </form>
  );
}
