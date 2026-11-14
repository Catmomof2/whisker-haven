import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { appsQuery, catsQuery, type Application } from "@/lib/shelter";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/rescue/outreach")({
  head: () => ({
    meta: [
      { title: "Applicant outreach — Whisker Haven Shelter" },
      {
        name: "description",
        content:
          "Follow up with adoption applicants: who is still waiting to hear back, and how to reach them.",
      },
      { property: "og:title", content: "Applicant outreach — Whisker Haven Shelter" },
      {
        name: "og:description",
        content:
          "Follow up with adoption applicants: who is still waiting to hear back, and how to reach them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApplicantOutreach,
});

const STATUS: Record<string, string> = {
  pending: "bg-medical text-medical-foreground",
  approved: "bg-available text-available-foreground",
  declined: "bg-adopted text-adopted-foreground",
};

function ApplicantOutreach() {
  const { data: apps = [] } = useQuery(appsQuery);
  const { data: cats = [] } = useQuery(catsQuery);
  const [filter, setFilter] = useState("pending");

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "Any cat";
  const pending = apps.filter((a) => a.status === "pending");
  // listApplications already returns newest first; keep that order so the
  // people waiting longest to hear back are never buried.
  const list = apps.filter((a) => filter === "all" || a.status === filter);

  return (
    <div>
      <PageHeader
        title="Applicant outreach"
        subtitle={`${pending.length} ${pending.length === 1 ? "person" : "people"} still waiting to hear back`}
        action={
          <Link
            to="/applications"
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-primary"
          >
            All applications →
          </Link>
        }
      />
      <div className="space-y-3 px-5">
        <div className="flex gap-4 rounded-xl bg-warm p-4 text-xs font-semibold text-primary-foreground shadow-soft">
          <span>
            <span className="font-bold text-foreground">{pending.length}</span> pending
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

        <div className="flex gap-2">
          {["pending", "approved", "declined", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ${filter === s ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {filter === "pending"
              ? "Nobody is waiting to hear back — you're all caught up."
              : "No applications here."}
          </p>
        )}

        {list.map((a) => (
          <ApplicantCard key={a.id} app={a} catName={catName} />
        ))}

        <Link
          to="/rescue"
          className="block rounded-xl border border-border bg-card p-4 text-sm font-semibold text-primary"
        >
          ← Back to rescue dashboard
        </Link>
      </div>
    </div>
  );
}

function ApplicantCard({
  app,
  catName,
}: {
  app: Application;
  catName: (id: string | null) => string;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{app.applicant_name}</p>
          <p className="text-xs text-muted-foreground">
            for <span className="font-bold text-primary">{catName(app.cat_id)}</span> ·{" "}
            {new Date(app.created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS[app.status] ?? ""}`}
        >
          {app.status}
        </span>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <a
          href={`mailto:${app.email}`}
          className="flex items-center gap-1.5 font-semibold text-primary"
        >
          <Mail className="h-3.5 w-3.5" />
          {app.email}
        </a>
        {app.phone && (
          <a href={`tel:${app.phone}`} className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {app.phone}
          </a>
        )}
      </div>
      {app.message && <p className="rounded-lg bg-muted p-2.5 text-sm">“{app.message}”</p>}
      <Link
        to="/applications"
        className="flex items-center justify-end gap-1 text-xs font-bold text-primary"
      >
        Open in applications <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
