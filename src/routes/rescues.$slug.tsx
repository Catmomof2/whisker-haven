import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { listAdoptableCats } from "@/lib/shelter.functions";
import { CatAvatar } from "@/components/AppShell";

const rescuePageQuery = (slug: string) => ({
  queryKey: ["adoptable", slug],
  queryFn: () => listAdoptableCats({ data: { slug } }),
});

export const Route = createFileRoute("/rescues/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(rescuePageQuery(params.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.shelter.name ?? "Rescue"} — Whisker Haven` },
      {
        name: "description",
        content: `Meet the adult cats waiting for a home at ${loaderData?.shelter.name ?? "this rescue"} and share their page with adopters.`,
      },
      { property: "og:title", content: `${loaderData?.shelter.name ?? "Rescue"} — Whisker Haven` },
      {
        property: "og:description",
        content: `Meet the adult cats waiting for a home at ${loaderData?.shelter.name ?? "this rescue"}.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RescueDetailPage,
});

function RescueDetailPage() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(rescuePageQuery(slug));
  const cats = page?.cats ?? [];
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
      <header className="px-5 pb-4 pt-8">
        <h1 className="font-display text-3xl font-semibold">{page?.shelter.name ?? "Rescue"}</h1>
        <p className="mt-2 text-lg font-semibold">Adult cats looking for home</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {page
            ? cats.length === 0
              ? "No cats are available right now — check back soon!"
              : cats.length === 1
                ? "1 cat waiting for a home here."
                : `${cats.length} cats waiting for a home here.`
            : "This rescue link is not available."}
        </p>
      </header>

      <div className="space-y-3 px-5">
        {page && (
          <Link
            to="/adopt"
            search={{ rescue: slug }}
            className="flex items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
          >
            Meet the cats →
          </Link>
        )}
        {page && (
          <button
            onClick={copyLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied!" : "Share this rescue"}
          </button>
        )}
        {!page && (
          <Link
            to="/rescues"
            className="flex items-center justify-center rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft"
          >
            ← Back to all rescues
          </Link>
        )}
      </div>

      {page && cats.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-xl font-semibold">Waiting for a home</h2>
          <div className="mt-3 space-y-4">
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/adopt/$id"
                params={{ id: c.id }}
                search={{ rescue: slug }}
                className="block overflow-hidden rounded-xl border border-border bg-card shadow-soft"
              >
                {c.photo_url ? (
                  <img
                    src={c.photo_url}
                    alt={c.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-warm">
                    <CatAvatar src={null} name={c.name} className="h-20 w-20" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display text-2xl font-semibold">{c.name}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {[c.age_years != null && `${c.age_years} yrs`, c.sex, c.breed, c.color]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {c.bio ? (
                    <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm leading-relaxed">
                      {c.bio}
                    </p>
                  ) : (
                    c.temperament && <p className="mt-3 text-sm">{c.temperament}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {page && (
        <p className="mt-8 flex items-center justify-center gap-1.5 px-5 text-center text-xs text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Share this page to help {page.shelter.name} reach adopters.
        </p>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Link to="/rescues" className="font-semibold">
          ← All rescues
        </Link>
        {" · "}
        <Link to="/for-rescues" className="font-semibold">
          Run a rescue? Join Whisker Haven
        </Link>
      </p>
    </div>
  );
}
