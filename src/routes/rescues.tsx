import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PawPrint } from "lucide-react";
import { listRescues } from "@/lib/shelter.functions";

const rescuesQuery = { queryKey: ["rescues"], queryFn: () => listRescues() };

export const Route = createFileRoute("/rescues")({
  loader: ({ context }) => context.queryClient.ensureQueryData(rescuesQuery),
  head: () => ({
    meta: [
      { title: "Find a rescue — Whisker Haven" },
      {
        name: "description",
        content:
          "Browse every rescue on Whisker Haven and meet the adult cats waiting for a home at each one.",
      },
      { property: "og:title", content: "Find a rescue — Whisker Haven" },
      {
        property: "og:description",
        content:
          "Browse every rescue on Whisker Haven and meet the adult cats waiting for a home at each one.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RescuesPage,
});

function RescuesPage() {
  const { data: rescues } = useSuspenseQuery(rescuesQuery);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <header className="px-5 pb-4 pt-8">
        <h1 className="font-display text-3xl font-semibold">Find a rescue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every rescue on Whisker Haven, in one place. Pick one to meet the adult cats waiting for a
          home there.
        </p>
      </header>
      <div className="space-y-3 px-5">
        {rescues.length === 0 && (
          <p className="rounded-xl bg-card p-5 text-sm">
            No rescues are listed yet — check back soon!
          </p>
        )}
        {rescues.map((r) => (
          <Link
            key={r.id}
            to="/adopt"
            search={{ rescue: r.slug }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm">
              <PawPrint className="h-5 w-5 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-xl font-semibold">{r.name}</span>
              <span className="block text-xs font-semibold text-muted-foreground">
                {r.available_count === 0
                  ? "No cats available right now"
                  : r.available_count === 1
                    ? "1 cat waiting for a home"
                    : `${r.available_count} cats waiting for a home`}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold text-primary">Meet the cats →</span>
          </Link>
        ))}
        <Link
          to="/signup"
          className="flex items-center justify-center rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft"
        >
          Run a rescue? Register yours →
        </Link>
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Link to="/auth" search={{}} className="font-semibold">
          Staff sign-in
        </Link>
        {" · "}
        <Link to="/rescue" className="font-semibold">
          Staff rescue dashboard
        </Link>
      </p>
    </div>
  );
}
