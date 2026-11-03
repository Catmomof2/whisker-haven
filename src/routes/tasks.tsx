import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Plus, RotateCcw, Trash2, Utensils, Pill, Sparkles } from "lucide-react";
import { addTask, setTaskDone, deleteTask, resetTasks } from "@/lib/data.functions";
import { tasksQuery, type Task } from "@/lib/shelter";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Daily Tasks — Whisker Haven Shelter" },
      { name: "description", content: "Daily feeding, medication, and cleaning checklist for staff and volunteers." },
      { property: "og:title", content: "Daily Tasks — Whisker Haven Shelter" },
      { property: "og:description", content: "Daily feeding, medication, and cleaning checklist for staff and volunteers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tasks,
});

const CATS = [
  { id: "feeding", label: "Feedings", icon: Utensils },
  { id: "medication", label: "Medications", icon: Pill },
  { id: "cleaning", label: "Habitat cleaning", icon: Sparkles },
];

function Tasks() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery(tasksQuery);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("feeding");
  const [time, setTime] = useState("");
  const done = tasks.filter((t) => t.done).length;
  const refresh = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  async function toggle(t: Task) {
    qc.setQueryData<Task[]>(["tasks"], (o) => o?.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    await setTaskDone({ data: { id: t.id, done: !t.done } });
    refresh();
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({ data: { title: title.trim(), category: cat as "feeding", time_slot: time || null } });
    setTitle(""); setTime(""); refresh();
  }

  return (
    <div>
      <PageHeader
        title="Today's tasks"
        subtitle={`${done} of ${tasks.length} complete`}
        action={<button onClick={async () => { await resetTasks(); refresh(); }} className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold"><RotateCcw className="h-3.5 w-3.5" />New day</button>}
      />
      <div className="space-y-4 px-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
        </div>
        {CATS.map((c) => {
          const list = tasks.filter((t) => t.category === c.id);
          return (
            <section key={c.id} className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold"><c.icon className="h-4 w-4 text-primary" />{c.label}</h2>
              {list.length === 0 && <p className="text-xs text-muted-foreground">Nothing scheduled.</p>}
              {list.map((t) => (
                <div key={t.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
                  <button onClick={() => toggle(t)} aria-label="Toggle" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 ${t.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {t.done && <Check className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                    {t.time_slot && <p className="text-[11px] text-muted-foreground">{t.time_slot}</p>}
                  </div>
                  <button aria-label="Delete" onClick={async () => { await deleteTask({ data: { id: t.id } }); refresh(); }} className="text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </section>
          );
        })}
        <form onSubmit={add} className="space-y-2 rounded-xl border border-dashed border-border bg-card p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none" />
          <div className="flex gap-2">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time" className="w-24 rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
            <button className="rounded-xl bg-primary px-3 text-primary-foreground" aria-label="Add"><Plus className="h-5 w-5" /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
