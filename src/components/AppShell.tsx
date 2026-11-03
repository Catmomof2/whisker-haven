import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Cat, ListChecks, FileHeart } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cats", label: "Cats", icon: Cat },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/applications", label: "Applications", icon: FileHeart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.to === "/" ? path === "/" : path.startsWith(t.to) || (t.to === "/cats" && path.startsWith("/board"));
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-8">
      <div>
        <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function StageBadge({ stage, priority }: { stage: string; priority?: boolean }) {
  const map: Record<string, [string, string]> = {
    intake: ["Intake", "bg-intake text-intake-foreground"],
    medical: ["Medical Hold", "bg-medical text-medical-foreground"],
    available: ["Available", "bg-available text-available-foreground"],
    foster: ["Foster", "bg-foster text-foster-foreground"],
    adopted: ["Adopted", "bg-adopted text-adopted-foreground"],
  };
  const [label, cls] = map[stage] ?? map.intake;
  return (
    <span className="inline-flex gap-1">
      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>
      {priority && <span className="rounded-full bg-intake px-2.5 py-0.5 text-[11px] font-bold text-intake-foreground">Priority</span>}
    </span>
  );
}

export function CatAvatar({ src, name, className = "h-14 w-14" }: { src: string | null; name: string; className?: string }) {
  return src ? (
    <img src={src} alt={name} className={`${className} shrink-0 rounded-xl object-cover`} />
  ) : (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-warm font-display text-xl font-semibold text-primary-foreground`}>
      {name.slice(0, 1)}
    </div>
  );
}
