export function monthlyAdoptions(cats: { stage: string; adopted_at: string | null }[], now: Date) {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return cats.filter((cat) => {
    if (cat.stage !== "adopted" || !cat.adopted_at) return false;
    const time = Date.parse(cat.adopted_at);
    return time >= start && time < end;
  }).length;
}