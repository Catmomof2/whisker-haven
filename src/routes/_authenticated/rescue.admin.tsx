import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { catsQuery, settingsQuery } from "@/lib/shelter";
import { saveAdoptionGoal, saveSettings } from "@/lib/data.functions";
import { monthlyAdoptions } from "@/lib/dashboard-metrics";
import { getRescue, getTeam, inviteStaff } from "@/lib/rescue.functions";

const rescueQuery = { queryKey: ["rescue"], queryFn: () => getRescue() };
const teamQuery = { queryKey: ["team"], queryFn: () => getTeam() };

export const Route = createFileRoute("/_authenticated/rescue/admin")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(rescueQuery),
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(catsQuery),
      context.queryClient.ensureQueryData(teamQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Rescue admin — Whisker Haven Shelter" },
      {
        name: "description",
        content: "Rescue settings, staff team, and invitations in one place.",
      },
      { property: "og:title", content: "Rescue admin — Whisker Haven Shelter" },
      {
        property: "og:description",
        content: "Rescue settings, staff team, and invitations in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RescueAdmin,
});

function RescueAdmin() {
  const { data: rescue } = useSuspenseQuery(rescueQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);
  const { data: members } = useSuspenseQuery(teamQuery);
  const qc = useQueryClient();

  const [staffInput, setStaffInput] = useState<string | null>(null);
  const [capInput, setCapInput] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviting, setInviting] = useState(false);

  const cap = settings?.capacity ?? 40;
  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const pct = Math.min(100, Math.round((inCare / cap) * 100));
  const now = new Date();
  const adopted = monthlyAdoptions(cats, now);
  const goal = settings?.monthly_adoption_goal ?? 0;
  const isOwner = rescue.role === "owner";

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied");
    } catch {
      toast.error("Please copy the link below");
    }
  }

  async function onSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSettings({
        data: {
          staff_email: (staffInput ?? settings?.staff_email ?? "").trim() || null,
          capacity: Number(capInput ?? cap),
        },
      });
      await qc.invalidateQueries({ queryKey: ["settings"] });
      setStaffInput(null);
      setCapInput(null);
      toast.success("Settings saved");
    } catch {
      toast.error("Please enter a valid email and capacity");
    } finally {
      setSavingSettings(false);
    }
  }

  async function onSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    setSavingGoal(true);
    try {
      await saveAdoptionGoal({ data: { goal: Number(goalInput ?? goal) } });
      await qc.invalidateQueries({ queryKey: ["settings"] });
      setGoalInput(null);
      toast.success("Monthly goal saved");
    } catch {
      toast.error("Couldn't save the goal");
    } finally {
      setSavingGoal(false);
    }
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const result = await inviteStaff({ data: { email: inviteEmail } });
      setInviteLink(`https://purrposeful-shelter-hub.lovable.app/auth?invite=${result.token}`);
      if (result.emailSent) toast.success("Confirmation invitation sent");
      else
        toast.error(
          `Email wasn't sent: ${result.emailError ?? "Please share the invitation link instead."}`,
        );
    } catch {
      toast.error("Couldn't create invitation");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Rescue admin"
        subtitle={`${rescue.name} — settings, team, and invitations.`}
      />
      <div className="space-y-4 px-5">
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold">Rescue settings</h2>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Rescue name</p>
            <p className="font-bold">{rescue.name}</p>
            <p className="text-xs text-muted-foreground">
              The name is set when the rescue signs up — there is no way to rename it here.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Public adoption page</p>
            <a
              className="block break-all text-sm text-primary underline"
              href={`/adopt?rescue=${rescue.slug}`}
            >
              /adopt?rescue={rescue.slug}
            </a>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => copy(`${window.location.origin}/adopt?rescue=${rescue.slug}`)}
            >
              <Copy /> Copy adoption link
            </Button>
          </div>
          <div className="rounded-xl bg-warm p-4 text-primary-foreground shadow-soft">
            <p className="text-sm font-semibold opacity-90">Live capacity</p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {inCare}
              <span className="text-lg opacity-80"> / {cap} cats</span>
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
          <form onSubmit={onSaveSettings} className="space-y-3">
            <label className="block text-xs font-bold text-muted-foreground">
              Staff notification email
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={staffInput ?? settings?.staff_email ?? ""}
                onChange={(e) => setStaffInput(e.target.value)}
              />
            </label>
            <label className="block text-xs font-bold text-muted-foreground">
              Shelter capacity
              <input
                inputMode="numeric"
                type="number"
                min={1}
                max={10000}
                step={1}
                required
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={capInput ?? cap}
                onChange={(e) => setCapInput(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={savingSettings} className="w-full">
              {savingSettings ? "Saving…" : "Save settings"}
            </Button>
          </form>
          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold">Monthly adoption goal</h3>
              <span className="text-xs text-muted-foreground">
                {now.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>
            <p className="font-display text-3xl font-semibold">
              {adopted}
              <span className="text-base text-muted-foreground">
                {goal > 0 ? ` / ${goal} adoptions` : " adoptions this month"}
              </span>
            </p>
            {goal > 0 && (
              <>
                <progress
                  aria-label="Monthly adoption progress"
                  value={Math.min(adopted, goal)}
                  max={goal}
                  className="h-3 w-full accent-primary"
                />
                <p className="text-sm text-muted-foreground">
                  {adopted >= goal ? "Goal reached!" : `${goal - adopted} more cats to find a home`}
                </p>
              </>
            )}
            <form onSubmit={onSaveGoal} className="flex items-end gap-3">
              <label className="min-w-0 flex-1 text-xs font-semibold text-muted-foreground">
                Adoption goal
                <input
                  aria-label="Monthly adoption goal"
                  type="number"
                  min={0}
                  max={10000}
                  step={1}
                  required
                  value={goalInput ?? goal}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
              </label>
              <Button type="submit" disabled={savingGoal}>
                {savingGoal ? "Saving…" : "Save goal"}
              </Button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Team</h2>
            <Link to="/team" className="text-xs font-bold text-primary">
              Manage team →
            </Link>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3">
                  <p className="min-w-0 break-all text-sm">{m.email}</p>
                  <span className="shrink-0 text-xs capitalize text-muted-foreground">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Removing a staff member lives on the team page — only the rescue owner can do it.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold">Invitations</h2>
          {isOwner ? (
            <>
              <form onSubmit={onInvite} className="space-y-3">
                <label className="block text-sm">
                  Staff email
                  <input
                    aria-label="Staff email"
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3"
                  />
                </label>
                <Button disabled={inviting} type="submit" className="w-full">
                  {inviting ? "Sending…" : "Send invitation"}
                </Button>
              </form>
              {inviteLink && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Send this link to {inviteEmail}. It expires in seven days.
                  </p>
                  <input
                    aria-label="Invitation link"
                    readOnly
                    value={inviteLink}
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs"
                  />
                  <Button variant="outline" onClick={() => copy(inviteLink)}>
                    <Copy /> Copy invitation
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Only the rescue owner can invite staff.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Invitations expire seven days after sending. There is no list of pending invitations to
            check — if someone never got theirs, send a fresh invitation.
          </p>
          <Link to="/team" className="text-xs font-bold text-primary">
            Invite staff on the team page →
          </Link>
        </section>

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
