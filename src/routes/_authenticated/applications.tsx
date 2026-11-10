import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Mail, Phone, Home, X, Settings } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { setApplicationStatus, saveSettings as saveSettingsFn } from "@/lib/data.functions";
import { appsQuery, catsQuery, settingsQuery } from "@/lib/shelter";
import { PageHeader } from "@/components/AppShell";
import { createStaffApplication } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Adoption Applications — Whisker Haven Shelter" },
      { name: "description", content: "Review adoption applications and track shelter capacity." },
      { property: "og:title", content: "Adoption Applications — Whisker Haven Shelter" },
      { property: "og:description", content: "Review adoption applications and track shelter capacity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Applications,
});

const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const STATUS: Record<string, string> = {
  pending: "bg-medical text-medical-foreground",
  approved: "bg-available text-available-foreground",
  declined: "bg-adopted text-adopted-foreground",
};

function Applications() {
  const qc = useQueryClient();
  const { data: apps = [] } = useQuery(appsQuery);
  const { data: cats = [] } = useQuery(catsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState("pending");
  const submit = useServerFn(createStaffApplication);
  const blank = { cat_id: "", applicant_name: "", email: "", phone: "", home_type: "", other_pets: "", message: "" };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState("");
  const [cap, setCap] = useState("");

  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const capacity = settings?.capacity ?? 40;
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "Any cat";
  const list = apps.filter((a) => filter === "all" || a.status === filter);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: { ...f, cat_id: f.cat_id || null } });
      toast.success("Application saved");
      setF(blank); setOpen(false);
      qc.invalidateQueries({ queryKey: ["applications"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit");
    } finally { setBusy(false); }
  }
  async function setStatus(id: string, status: string, cat_id: string | null) {
    void cat_id;
    await setApplicationStatus({ data: { id, status: status as "approved" } });
    qc.invalidateQueries();
    toast.success(`Application ${status}`);
  }
  async function saveSettings() {
    try { await saveSettingsFn({ data: { staff_email: staff.trim() || null, capacity: cap ? Number(cap) : capacity } }); }
    catch { toast.error("Please enter a valid email and capacity"); return; }
    qc.invalidateQueries({ queryKey: ["settings"] });
    setShowSettings(false);
    toast.success("Settings saved");
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle={`${apps.filter((a) => a.status === "pending").length} awaiting review`}
        action={
          <div className="flex gap-2">
            <button aria-label="Settings" onClick={() => { setStaff(settings?.staff_email ?? ""); setCap(String(capacity)); setShowSettings(true); }} className="rounded-xl border border-border bg-card p-2.5"><Settings className="h-5 w-5" /></button>
            <button aria-label="New application" onClick={() => setOpen(true)} className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-soft"><Plus className="h-5 w-5" /></button>
          </div>
        }
      />
      <div className="space-y-3 px-5">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-warm p-4 text-center text-primary-foreground shadow-soft">
          <div><p className="font-display text-2xl font-semibold">{inCare}</p><p className="text-[11px] font-semibold opacity-90">In care</p></div>
          <div><p className="font-display text-2xl font-semibold">{capacity - inCare}</p><p className="text-[11px] font-semibold opacity-90">Open spaces</p></div>
          <div><p className="font-display text-2xl font-semibold">{cats.filter((c) => c.stage === "available").length}</p><p className="text-[11px] font-semibold opacity-90">Adoptable</p></div>
        </div>
        {!settings?.staff_email && (
          <p className="rounded-xl bg-medical p-3 text-xs font-semibold text-medical-foreground">Add a staff email in settings to receive notifications for new applications.</p>
        )}
        <div className="flex gap-2">
          {["pending", "approved", "declined", "all"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ${filter === s ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>{s}</button>
          ))}
        </div>
        {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No applications here.</p>}
        {list.map((a) => (
          <div key={a.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{a.applicant_name}</p>
                <p className="text-xs text-muted-foreground">for <span className="font-bold text-primary">{catName(a.cat_id)}</span> · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS[a.status] ?? ""}`}>{a.status}</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{a.email}</p>
              {a.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{a.phone}</p>}
              {a.home_type && <p className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" />{a.home_type}{a.other_pets && ` · ${a.other_pets}`}</p>}
            </div>
            {a.message && <p className="rounded-lg bg-muted p-2.5 text-sm">“{a.message}”</p>}
            {a.status === "pending" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setStatus(a.id, "declined", a.cat_id)} className="rounded-xl border border-border py-2 text-sm font-bold">Decline</button>
                <button onClick={() => setStatus(a.id, "approved", a.cat_id)} className="rounded-xl bg-available py-2 text-sm font-bold text-available-foreground">Approve</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(open || showSettings) && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/40" onClick={() => { setOpen(false); setShowSettings(false); }}>
          <div className="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{open ? "New application" : "Shelter settings"}</h2>
              <button onClick={() => { setOpen(false); setShowSettings(false); }} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {open ? (
              <form onSubmit={send} className="space-y-3">
                <select className={field} value={f.cat_id} onChange={(e) => setF({ ...f, cat_id: e.target.value })}>
                  <option value="">Any cat</option>
                  {cats.filter((c) => c.stage === "available" || c.stage === "foster").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input required className={field} placeholder="Full name" value={f.applicant_name} onChange={(e) => setF({ ...f, applicant_name: e.target.value })} />
                <input required type="email" className={field} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <input className={field} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <input className={field} placeholder="Home type (apartment, house…)" value={f.home_type} onChange={(e) => setF({ ...f, home_type: e.target.value })} />
                <input className={field} placeholder="Other pets" value={f.other_pets} onChange={(e) => setF({ ...f, other_pets: e.target.value })} />
                <textarea rows={3} className={field} placeholder="Why this cat?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
                <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Submitting…" : "Submit application"}</button>
              </form>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-muted-foreground">Staff notification email<input type="email" className={field + " mt-1"} value={staff} onChange={(e) => setStaff(e.target.value)} /></label>
                <label className="block text-xs font-bold text-muted-foreground">Shelter capacity<input inputMode="numeric" className={field + " mt-1"} value={cap} onChange={(e) => setCap(e.target.value)} /></label>
                <button onClick={saveSettings} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Save</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
