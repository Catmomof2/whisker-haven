import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Cat = Database["public"]["Tables"]["cats"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];

export const STAGES = [
  { id: "intake", label: "Intake", badge: "bg-intake text-intake-foreground" },
  { id: "medical", label: "Medical Hold", badge: "bg-medical text-medical-foreground" },
  { id: "available", label: "Available", badge: "bg-available text-available-foreground" },
  { id: "foster", label: "Foster Care", badge: "bg-foster text-foster-foreground" },
  { id: "adopted", label: "Adopted", badge: "bg-adopted text-adopted-foreground" },
] as const;

export const stageOf = (id: string) => STAGES.find((s) => s.id === id) ?? STAGES[0];

export const catsQuery = {
  queryKey: ["cats"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cats").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
export const tasksQuery = {
  queryKey: ["tasks"],
  queryFn: async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
};
export const appsQuery = {
  queryKey: ["applications"],
  queryFn: async () => {
    const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
};

export async function fileToDataUrl(file: File, max = 640): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}
