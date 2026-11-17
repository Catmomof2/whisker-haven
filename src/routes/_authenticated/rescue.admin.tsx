import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { RescueAdminPanel } from "@/components/RescueAdminPanel";
import { catsQuery, settingsQuery } from "@/lib/shelter";
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
  const { data: members } = useSuspenseQuery(teamQuery);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviting, setInviting] = useState(false);
  const isOwner = rescue.role === "owner";

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied");
    } catch {
      toast.error("Please copy the link below");
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
        <RescueAdminPanel />

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
