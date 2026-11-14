import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveAdoptionGoal } from "@/lib/data.functions";
import { monthlyAdoptions } from "@/lib/dashboard-metrics";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Globe, Plus, Kanban, AlertTriangle, ChevronRight } from "lucide-react";
import { PageHeader, StageBadge, CatAvatar } from "@/components/AppShell";
import { catsQuery, tasksQuery, appsQuery, settingsQuery, STAGES } from "@/lib/shelter";
import { getRescue } from "@/lib/rescue.functions";

const rescueQuery = { queryKey: ["rescue"], queryFn: () => getRescue() };

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(rescueQuery), context.queryClient.ensureQueryData(catsQuery),
      context.queryClient.ensureQueryData(tasksQuery), context.queryClient.ensureQueryData(appsQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Whisker Haven Shelter" },
      { name: "description", content: "Live shelter capacity, today's tasks, and pending adoptions at a glance." },
      { property: "og:title", content: "Dashboard — Whisker Haven Shelter" },
      { property: "og:description", content: "Live shelter capacity, today's tasks, and pending adoptions at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: rescue } = useSuspenseQuery(rescueQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const { data: apps } = useSuspenseQuery(appsQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const [goalInput, setGoalInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  }
  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const cap = settings?.capacity ?? 40;
  const pct = Math.min(100, Math.round((inCare / cap) * 100));
  const done = tasks.filter((t) => t.done).length;
  const pending = apps.filter((a) => a.status === "pending").length;
  const priority = cats.filter((c) => c.priority && c.stage !== "adopted");
  const now = new Date();
  const adopted = monthlyAdoptions(cats, now);
  const goal = settings.monthly_adoption_goal;
  async function saveGoal(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await saveAdoptionGoal({ data: { goal: Number(goalInput ?? goal) } });
      await qc.invalidateQueries({ queryKey: ["settings"] });
      setGoalInput(null); toast.success("Monthly goal saved");
    } catch { toast.error("Couldn't save the goal"); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title={rescue?.name ?? "Your rescue"} subtitle="Good day! Here's the shelter today."
        action={
          <div className="flex gap-2">
            <Link to="/adopt" search={{ rescue: rescue?.slug ?? "" }} aria-label="Public adoption page" className="rounded-full border border-border bg-card p-2.5"><Globe className="h-4 w-4" /></Link>
            <Button variant="outline" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
          </div>
        }
      />
      <div className="space-y-4 px-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/rescue" className="text-sm font-semibold text-primary">Rescue dashboard →</Link>
          <Link to="/team" className="text-sm font-semibold text-primary">Rescue team & adoption link →</Link>
        </div>
        <div className="rounded-xl bg-warm p-5 text-primary-foreground shadow-soft">
          <p className="text-sm font-semibold opacity-90">Live capacity</p>
          <p className="mt-1 font-display text-4xl font-semibold">
            {inCare}<span className="text-xl opacity-80"> / {cap} cats</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold opacity-90">{pct}% full · {cap - inCare} spaces open</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Tasks done" value={`${done}/${tasks.length}`} to="/tasks" />
          <Stat label="Pending apps" value={pending} to="/applications" />
          <Stat label="Available" value={cats.filter((c) => c.stage === "available").length} to="/board" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/cats/new" className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft">
            <Plus className="h-4 w-4" /> New intake
          </Link>
          <Link to="/board" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-bold">
            <Kanban className="h-4 w-4" /> Workflow board
          </Link>
        </div>

        <section className="space-y-3 border-b border-border py-4">
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold">Monthly adoption goal</h2><span className="text-xs text-muted-foreground">{now.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</span></div>
          <p className="font-display text-3xl font-semibold">{adopted}<span className="text-base text-muted-foreground">{goal > 0 ? ` / ${goal} adoptions` : " adoptions this month"}</span></p>
          {goal > 0 && <><progress aria-label="Monthly adoption progress" value={Math.min(adopted, goal)} max={goal} className="h-3 w-full accent-primary" /><p className="text-sm text-muted-foreground">{adopted >= goal ? "Goal reached!" : `${goal - adopted} more cats to find a home`}</p></>}
          <form onSubmit={saveGoal} className="flex items-end gap-3">
            <label className="min-w-0 flex-1 text-xs font-semibold text-muted-foreground">Adoption goal<input aria-label="Monthly adoption goal" type="number" min={0} max={10000} step={1} required value={goalInput ?? goal} onChange={(e) => setGoalInput(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" /></label>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save goal"}</Button>
          </form>
        </section>

        <section className="space-y-3 border-b border-border py-4">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Adoption applications</h2><Link to="/applications" className="text-xs font-semibold text-primary">View all →</Link></div>
          <div className="grid grid-cols-3 gap-3">{["pending", "approved", "declined"].map((status) => <div key={status}><p className="font-display text-2xl font-semibold">{apps.filter((a) => a.status === status).length}</p><p className="text-xs capitalize text-muted-foreground">{status}</p></div>)}</div>
          {apps.slice(0, 3).map((app) => <Link key={app.id} to="/applications" className="flex items-center justify-between gap-3 border-t border-border py-2"><span className="min-w-0 truncate text-sm font-semibold">{app.applicant_name}</span><span className="text-xs capitalize text-muted-foreground">{app.status}</span></Link>)}
        </section>

        <section className="border-b border-border py-4">
          <h2 className="mb-3 text-sm font-bold">Cats by stage</h2>
          <div className="space-y-2">
            {STAGES.map((s) => {
              const n = cats.filter((c) => c.stage === s.id).length;
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <StageBadge stage={s.id} />
                  <span className="text-sm font-bold">{n}</span>
                </div>
              );
            })}
          </div>
        </section>

        {priority.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-intake-foreground">
              <AlertTriangle className="h-4 w-4" /> Priority intake
            </h2>
            <div className="space-y-2">
              {priority.map((c) => (
                <Link key={c.id} to="/cats/$id" params={{ id: c.id }} className="flex items-center gap-3">
                  <CatAvatar src={c.photo_url} name={c.name} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{c.health_notes}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: string | number; to: "/tasks" | "/applications" | "/board" }) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-card p-3">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
    </Link>
  );
}
