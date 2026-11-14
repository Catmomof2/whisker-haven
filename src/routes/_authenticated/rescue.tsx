import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Globe, Stethoscope } from "lucide-react";
import { CatAvatar, PageHeader, StageBadge } from "@/components/AppShell";
import {
  appsQuery,
  catsQuery,
  settingsQuery,
  tasksQuery,
  STAGES,
  type Application,
} from "@/lib/shelter";
import { getRescue } from "@/lib/rescue.functions";

export const Route = createFileRoute("/_authenticated/rescue")({
  head: () => ({
    meta: [
      { title: "Rescue dashboard — Whisker Haven Shelter" },
      {
        name: "description",
        content:
          "Your rescue at a glance: capacity, cats by stage, applications, tasks, medical holds, and recent activity.",
      },
      { property: "og:title", content: "Rescue dashboard — Whisker Haven Shelter" },
      {
        name: "og:description",
        content:
          "Your rescue at a glance: capacity, cats by stage, applications, tasks, medical holds, and recent activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RescueDashboard,
});

const TASK_CATEGORIES = [
  { id: "feeding", label: "Feeding" },
  { id: "medication", label: "Medication" },
  { id: "cleaning", label: "Cleaning" },
] as const;

function RescueDashboard() {
  const { data: rescue } = useQuery({ queryKey: ["rescue"], queryFn: () => getRescue() });
  const { data: cats = [] } = useQuery(catsQuery);
  const { data: tasks = [] } = useQuery(tasksQuery);
  const { data: apps = [] } = useQuery(appsQuery);
  const { data: settings } = useQuery(settingsQuery);

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "Any cat";
  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const cap = settings?.capacity ?? 40;
  const pct = Math.min(100, Math.round((inCare / cap) * 100));
  const openTasks = tasks.filter((t) => !t.done);
  const pendingApps = apps.filter((a) => a.status === "pending");
  const medical = cats.filter((c) => c.stage === "medical");
  const priority = cats.filter((c) => c.priority && c.stage !== "adopted");
  const recentCats = cats.slice(0, 3);
  const recentApps = apps.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={rescue?.name ?? "Your rescue"}
        subtitle="Rescue dashboard — the whole rescue at a glance."
        action={
          <Link
            to="/adopt"
            search={{ rescue: rescue?.slug ?? "" }}
            aria-label="Public adoption page"
            className="rounded-full border border-border bg-card p-2.5"
          >
            <Globe className="h-4 w-4" />
          </Link>
        }
      />
      <div className="space-y-4 px-5">
        <div className="rounded-xl bg-warm p-5 text-primary-foreground shadow-soft">
          <p className="text-sm font-semibold opacity-90">Live capacity</p>
          <p className="mt-1 font-display text-4xl font-semibold">
            {inCare}
            <span className="text-xl opacity-80"> / {cap} cats</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-foreground/25">
            <div
              className="h-full rounded-full bg-primary-foreground"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold opacity-90">
            {pct}% full · {cap - inCare} spaces open
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Pending applications" value={pendingApps.length} to="/applications" />
          <Stat label="Open tasks" value={openTasks.length} to="/tasks" />
          <Stat
            label="Available cats"
            value={cats.filter((c) => c.stage === "available").length}
            to="/board"
          />
          <Stat
            label="Adopted"
            value={cats.filter((c) => c.stage === "adopted").length}
            to="/board"
          />
        </div>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Cats by stage</h2>
            <Link to="/board" className="text-xs font-bold text-primary">
              Workflow board →
            </Link>
          </div>
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

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Applications</h2>
            <Link to="/applications" className="text-xs font-bold text-primary">
              All applications →
            </Link>
          </div>
          <div className="mb-3 flex gap-4 text-xs font-semibold text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{pendingApps.length}</span> pending
            </span>
            <span>
              <span className="font-bold text-foreground">
                {apps.filter((a) => a.status === "approved").length}
              </span>{" "}
              approved
            </span>
            <span>
              <span className="font-bold text-foreground">
                {apps.filter((a) => a.status === "declined").length}
              </span>{" "}
              declined
            </span>
          </div>
          {pendingApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending applications.</p>
          ) : (
            <div className="space-y-2">
              {pendingApps.slice(0, 3).map((a) => (
                <ApplicationRow key={a.id} app={a} catName={catName} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Open tasks</h2>
            <Link to="/tasks" className="text-xs font-bold text-primary">
              Daily checklist →
            </Link>
          </div>
          <div className="space-y-2">
            {TASK_CATEGORIES.map((cat) => {
              const n = openTasks.filter((t) => t.category === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{cat.label}</span>
                  <span className="text-sm font-bold">
                    {n} open · {tasks.filter((t) => t.category === cat.id && t.done).length} done
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Stethoscope className="h-4 w-4" /> Medical hold
          </h2>
          {medical.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cats on medical hold.</p>
          ) : (
            <div className="space-y-2">
              {medical.map((c) => (
                <Link
                  key={c.id}
                  to="/cats/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3"
                >
                  <CatAvatar src={c.photo_url} name={c.name} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{c.health_notes}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {priority.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-bold">Priority intake</h2>
            <div className="mt-3 space-y-2">
              {priority.map((c) => (
                <Link
                  key={c.id}
                  to="/cats/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3"
                >
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

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold">Recent activity</h2>
          {recentCats.length === 0 && recentApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — new intakes and applications will show up here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentCats.map((c) => (
                <Link
                  key={c.id}
                  to="/cats/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3"
                >
                  <CatAvatar src={c.photo_url} name={c.name} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StageBadge stage={c.stage} />
                </Link>
              ))}
              {recentApps.map((a) => (
                <ApplicationRow key={a.id} app={a} catName={catName} />
              ))}
            </div>
          )}
        </section>

        <Link
          to="/team"
          className="block rounded-xl border border-border bg-card p-4 text-sm font-semibold text-primary"
        >
          Rescue team & adoption link →
        </Link>
        <Link
          to="/rescue/outreach"
          className="block rounded-xl border border-border bg-card p-4 text-sm font-semibold text-primary"
      >
                  Applicant outreach →
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  to,
}: {
  label: string;
  value: string | number;
  to: "/applications" | "/tasks" | "/board";
}) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-card p-3">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
    </Link>
  );
}

function ApplicationRow({
  app,
  catName,
}: {
  app: Application;
  catName: (id: string | null) => string;
}) {
  return (
    <Link to="/applications" className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-bold">{app.applicant_name}</p>
        <p className="text-xs text-muted-foreground">
          for <span className="font-bold text-primary">{catName(app.cat_id)}</span> ·{" "}
          {new Date(app.created_at).toLocaleDateString()}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
