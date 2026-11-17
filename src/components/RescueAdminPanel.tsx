import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { catsQuery, settingsQuery } from "@/lib/shelter";
import { saveAdoptionGoal, saveSettings } from "@/lib/data.functions";
import { monthlyAdoptions } from "@/lib/dashboard-metrics";
import { getRescue, saveRescueDetails } from "@/lib/rescue.functions";

const rescueQuery = { queryKey: ["rescue"], queryFn: () => getRescue() };

export function RescueAdminPanel({ showCapacity = true }: { showCapacity?: boolean }) {
  const { data: rescue } = useSuspenseQuery(rescueQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);
  const qc = useQueryClient();
  const saveDetails = useServerFn(saveRescueDetails);
  const [details, setDetails] = useState({ name: rescue.name, location: rescue.location, contact_phone: rescue.contact_phone, adoption_heading: rescue.adoption_heading, adoption_intro: rescue.adoption_intro, adoption_process: rescue.adoption_process });
  const [savingDetails, setSavingDetails] = useState(false);
  const detailInput = "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground";

  const [staffInput, setStaffInput] = useState<string | null>(null);
  const [capInput, setCapInput] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const cap = settings?.capacity ?? 40;
  const inCare = cats.filter((c) => c.stage !== "adopted").length;
  const pct = Math.min(100, Math.round((inCare / cap) * 100));
  const now = new Date();
  const adopted = monthlyAdoptions(cats, now);
  const goal = settings?.monthly_adoption_goal ?? 0;
  const isOwner = rescue.role === "owner";

  async function onSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await saveDetails({ data: details });
      await Promise.all([qc.invalidateQueries({ queryKey: ["rescue"] }), qc.invalidateQueries({ queryKey: ["rescues"] }), qc.invalidateQueries({ queryKey: ["adoptable", rescue.slug] })]);
      toast.success("Rescue details and adoption page saved");
    } catch {
      toast.error("Couldn't save rescue details. Please try again.");
    } finally {
      setSavingDetails(false);
    }
  }

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

  return (
        <section aria-label="Rescue admin" className="space-y-3 border-b border-border py-4">
          <h2 className="font-display text-xl font-semibold">Rescue admin</h2>
          <h3 className="text-sm font-bold">Shelter details</h3>
          <form onSubmit={onSaveDetails} className="space-y-3">
            <fieldset disabled={!isOwner || savingDetails} className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground">Rescue name
                <input required maxLength={100} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} className={detailInput} />
              </label>
              <label className="block text-xs font-bold text-muted-foreground">Shelter location
                <input maxLength={200} value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} className={detailInput} />
              </label>
              <label className="block text-xs font-bold text-muted-foreground">Public contact phone
                <input type="tel" maxLength={40} value={details.contact_phone} onChange={(e) => setDetails({ ...details, contact_phone: e.target.value })} className={detailInput} />
              </label>
              <h3 className="border-t border-border pt-3 text-sm font-bold text-foreground">Adoption page text</h3>
              <label className="block text-xs font-bold text-muted-foreground">Adoption page heading
                <input required maxLength={160} value={details.adoption_heading} onChange={(e) => setDetails({ ...details, adoption_heading: e.target.value })} className={detailInput} />
              </label>
              <label className="block text-xs font-bold text-muted-foreground">Welcome text
                <textarea rows={4} maxLength={2000} value={details.adoption_intro} onChange={(e) => setDetails({ ...details, adoption_intro: e.target.value })} className={detailInput} />
              </label>
              <label className="block text-xs font-bold text-muted-foreground">Adoption process
                <textarea rows={5} maxLength={4000} value={details.adoption_process} onChange={(e) => setDetails({ ...details, adoption_process: e.target.value })} className={detailInput} />
              </label>
              {isOwner && <Button type="submit" className="w-full">{savingDetails ? "Saving…" : "Save rescue details"}</Button>}
            </fieldset>
            {!isOwner && <p className="text-sm text-muted-foreground">Only the rescue owner can edit these details.</p>}
          </form>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Public adoption page</p>
            <a
              className="block break-all text-sm text-primary underline"
              href={`/adopt?rescue=${rescue.slug}`}
            >
              View adoption page →
            </a>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => copy(`${window.location.origin}/adopt?rescue=${rescue.slug}`)}
            >
              <Copy /> Copy adoption link
            </Button>
          </div>
          {showCapacity && <div className="rounded-xl bg-warm p-4 text-primary-foreground shadow-soft">
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
          </div>}
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
  );
}
