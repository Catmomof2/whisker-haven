import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Heart, Megaphone, PawPrint, Sparkles, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/for-rescues")({
  head: () => ({
    meta: [
      { title: "For rescues — Whisker Haven" },
      {
        name: "description",
        content:
          "Run a cat rescue? Whisker Haven gives your team intake, medical tracking, a workflow board, and a public adoption page — free to join.",
      },
      { property: "og:title", content: "For rescues — Whisker Haven" },
      {
        property: "og:description",
        content:
          "Run a cat rescue? Whisker Haven gives your team intake, medical tracking, a workflow board, and a public adoption page — free to join.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForRescuesPage,
});

const FEATURES = [
  {
    icon: PawPrint,
    title: "Intake & profiles",
    body: "Every cat arrives with a photo, health notes, and a profile your team can keep up to date.",
  },
  {
    icon: Stethoscope,
    title: "Health & medical tracking",
    body: "Health checks, vet visits, and medical holds — tracked for every cat in your care.",
  },
  {
    icon: ClipboardList,
    title: "Workflow board & daily checklist",
    body: "Move cats through intake, medical, foster, and adoption, and keep feeding, medication, and cleaning on track.",
  },
  {
    icon: Heart,
    title: "Adoption application queue",
    body: "Applications come straight to your team to review, approve, or decline — with a meet & greet before a cat goes home.",
  },
  {
    icon: Megaphone,
    title: "Live capacity & a public page",
    body: "See how full you are at a glance, and get a public adoption page plus a listing in the rescue directory so adopters can find you.",
  },
  {
    icon: Sparkles,
    title: "AI adoption bio generator",
    body: "Turn intake traits and health notes into a warm, honest bio for each cat — ready to share.",
  },
] as const;

function ForRescuesPage() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <header className="px-5 pb-4 pt-8">
        <h1 className="font-display text-3xl font-semibold">For rescues</h1>
        <p className="mt-2 text-lg font-semibold">Your rescue, running in one place</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Whisker Haven is built for adult cat rescues. Your team gets the tools to look after every
          cat — and adopters get a simple way to meet them and apply.
        </p>
      </header>

      <div className="space-y-3 px-5">
        <Link
          to="/signup"
          className="flex items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Register your rescue →
        </Link>
        <Link
          to="/rescues"
          className="flex items-center justify-center rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft"
        >
          Browse the rescue directory →
        </Link>
      </div>

      <section className="mt-8 px-5">
        <h2 className="font-display text-xl font-semibold">What your rescue gets</h2>
        <div className="mt-3 space-y-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm">
                <f.icon className="h-5 w-5 text-primary" />
              </span>
              <span>
                <p className="font-bold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="font-display text-xl font-semibold">How it works</h2>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">1. Register your rescue</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign up with your rescue name and email — your rescue gets its own space and staff
              accounts.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">2. Add your cats</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Intake each cat with a photo and health notes, and track them through medical, foster,
              and available.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">3. Meet adopters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your cats appear on your public adoption page and in the directory. Applications land
              in your queue for review.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 px-5">
        <Link
          to="/signup"
          className="flex items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Register your rescue →
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Link to="/" className="font-semibold">
          Back to Whisker Haven
        </Link>
      </p>
    </div>
  );
}
