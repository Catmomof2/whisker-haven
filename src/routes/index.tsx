import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { listAdoptableCats } from "@/lib/shelter.functions";
import { CatAvatar } from "@/components/AppShell";

const landingQuery = (slug: string) => ({ queryKey: ["adoptable", slug], queryFn: () => listAdoptableCats({ data: { slug } }) });

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { rescue?: string } => ({ ...(typeof s["rescue"] === "string" ? { rescue: s["rescue"] } : {}) }),
  loaderDeps: ({ search }) => ({ slug: search.rescue ?? "whisker-haven" }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(landingQuery(deps.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.shelter.name ?? "Whisker Haven"} — Adult Cat Rescue` },
      { name: "description", content: "Whisker Haven is an adult cat rescue. Meet grown-up cats with settled personalities and apply to adopt." },
      { property: "og:title", content: `${loaderData?.shelter.name ?? "Whisker Haven"} — Adult Cat Rescue` },
      { property: "og:description", content: "Whisker Haven is an adult cat rescue. Meet grown-up cats with settled personalities and apply to adopt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { rescue } = Route.useSearch();
  const slug = rescue ?? "whisker-haven";
  const { data: page } = useSuspenseQuery(landingQuery(slug));
  const cats = page?.cats ?? [];
  const featured = cats.slice(0, 3);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <header className="px-5 pb-4 pt-8">
        <h1 className="font-display text-3xl font-semibold">{page?.shelter.name ?? "Whisker Haven"}</h1>
        <p className="mt-2 text-lg font-semibold">Adult cats looking for home</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Whisker Haven is an adult cat rescue. We take in grown-up cats, look after their health, and match them with homes where their settled personalities can shine. Find your match and apply in two minutes.
        </p>
      </header>

      <div className="space-y-3 px-5">
        {!page && <p>This rescue link is not available.</p>}
        {page && (
          <Link to="/adopt" search={{ rescue: slug }} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft">
            <Heart className="h-4 w-4" /> Meet the cats
          </Link>
        )}
        <Link to="/rescues" className="flex items-center justify-center rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft">
          Browse all rescues →
        </Link>
        <Link to="/for-rescues" className="flex items-center justify-center rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft">
          Run a rescue? Register yours →
        </Link>
      </div>

      {page && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-xl font-semibold">Waiting for a home</h2>
          {featured.length === 0 ? (
            <p className="mt-3 rounded-xl bg-card p-5 text-sm">No cats are available right now — check back soon!</p>
          ) : (
            <div className="mt-3 space-y-4">
              {featured.map((c) => (
                <Link key={c.id} to="/adopt/$id" params={{ id: c.id }} search={{ rescue: slug }} className="block overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-warm"><CatAvatar src={null} name={c.name} className="h-20 w-20" /></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-2xl font-semibold">{c.name}</h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {[c.age_years != null && `${c.age_years} yrs`, c.sex, c.breed, c.color].filter(Boolean).join(" · ")}
                    </p>
                    {c.bio ? <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm leading-relaxed">{c.bio}</p> : c.temperament && <p className="mt-3 text-sm">{c.temperament}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {cats.length > featured.length && (
            <Link to="/adopt" search={{ rescue: slug }} className="mt-4 block text-center text-sm font-bold text-primary">
              See all {cats.length} cats waiting for a home →
            </Link>
          )}
        </section>
      )}

      <section className="mt-8 px-5">
        <h2 className="font-display text-xl font-semibold">What we do</h2>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">Intake</p>
            <p className="mt-1 text-sm text-muted-foreground">Every cat arrives with a photo, health notes, and a safe place to land.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">Medical care</p>
            <p className="mt-1 text-sm text-muted-foreground">Health checks, vet visits, and daily care routines — tracked for every cat.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-bold">Adoptions</p>
            <p className="mt-1 text-sm text-muted-foreground">Applications reviewed by our team, with a meet &amp; greet before a cat goes home.</p>
          </div>
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground"><Link to="/auth" search={{}} className="font-semibold">Staff sign-in</Link></p>
    </div>
  );
}
