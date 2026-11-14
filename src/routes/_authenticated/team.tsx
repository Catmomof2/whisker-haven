import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { getRescue, getTeam, inviteStaff, removeStaff } from "@/lib/rescue.functions";

const rescueQuery = { queryKey: ["rescue"], queryFn: () => getRescue() };
const teamQuery = { queryKey: ["team"], queryFn: () => getTeam() };
export const Route = createFileRoute("/_authenticated/team")({
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(rescueQuery), context.queryClient.ensureQueryData(teamQuery)]); },
  head: () => ({ meta: [
    { title: "Rescue Team — Whisker Haven" }, { name: "description", content: "Manage your rescue staff and share your adoption page." },
    { property: "og:title", content: "Rescue Team — Whisker Haven" }, { property: "og:description", content: "Manage your rescue staff and adoption link." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Team,
});
function Team() {
  const { data: rescue } = useSuspenseQuery(rescueQuery);
  const { data: members } = useSuspenseQuery(teamQuery);
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); toast.success("Link copied"); } catch { toast.error("Please copy the link below"); } }
  async function invite(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const result = await inviteStaff({ data: { email } });
      setLink(`https://purrposeful-shelter-hub.lovable.app/auth?invite=${result.token}`);
      if (result.emailSent) toast.success("Confirmation invitation sent");
      else toast.error(`Email wasn't sent: ${result.emailError ?? "Please share the invitation link instead."}`);
    }
    catch { toast.error("Couldn't create invitation"); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this staff member’s access?")) return;
    try { await removeStaff({ data: { id } }); await qc.invalidateQueries({ queryKey: ["team"] }); }
    catch { toast.error("Couldn't remove staff member"); }
  }
  return <div>
    <PageHeader title="Rescue team" subtitle={rescue.name} />
    <div className="space-y-6 px-5">
      <section className="space-y-3">
        <h2 className="font-semibold">Adoption page</h2>
        <a className="block break-all text-sm text-primary underline" href={`/adopt?rescue=${rescue.slug}`}>/adopt?rescue={rescue.slug}</a>
        <Button variant="outline" onClick={() => copy(`${window.location.origin}/adopt?rescue=${rescue.slug}`)}><Copy /> Copy adoption link</Button>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Staff</h2>
        {members.map((m) => <div key={m.id} className="flex items-center justify-between gap-3 border-b border-border py-3">
          <div className="min-w-0"><p className="break-all text-sm">{m.email}</p><p className="text-xs capitalize text-muted-foreground">{m.role}</p></div>
          {rescue.role === "owner" && m.role === "staff" && <Button variant="ghost" size="icon" aria-label={`Remove ${m.email}`} onClick={() => remove(m.id)}><UserMinus /></Button>}
        </div>)}
      </section>
      {rescue.role === "owner" && <section className="space-y-3">
        <h2 className="font-semibold">Invite staff</h2>
        <form onSubmit={invite} className="space-y-3">
          <label className="block text-sm">Staff email<input aria-label="Staff email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3" /></label>
          <Button disabled={busy} type="submit" className="w-full">{busy ? "Sending…" : "Send invitation"}</Button>
        </form>
        {link && <div className="space-y-2"><p className="text-sm text-muted-foreground">Send this link to {email}. It expires in seven days.</p><input aria-label="Invitation link" readOnly value={link} className="w-full rounded-xl border border-border bg-card p-3 text-xs" /><Button variant="outline" onClick={() => copy(link)}><Copy /> Copy invitation</Button></div>}
      </section>}
    </div>
  </div>;
}