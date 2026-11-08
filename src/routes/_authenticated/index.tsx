import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Kanban, AlertTriangle, ChevronRight } from "lucide-react";
import { PageHeader, StageBadge, CatAvatar } from "@/components/AppShell";
import { catsQuery, tasksQuery, appsQuery, settingsQuery, STAGES } from "@/lib/shelter";

export const Route = createFileRoute("/_authenticated/")({
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
  const { data: cats = [] } = useQuery(catsQuery);
  const { data: tasks = [] } = useQuery(tasksQuery);
  const { data: apps = [] } = useQuery(appsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const cap = settings?.capacity ?? 40;
  const pct = Math.min(100, Math.round((inCare / cap) * 100));
  const done = tasks.filter((t) => t.done).length;
  const pending = apps.filter((a) => a.status === "pending").length;
  const priority = cats.filter((c) => c.priority && c.stage !== "adopted");

  return (
    <div>
      <PageHeader title="Whisker Haven" subtitle="Good day! Here's the shelter today." />
      <div className="space-y-4 px-5">
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

        <section className="rounded-xl border border-border bg-card p-4">
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
