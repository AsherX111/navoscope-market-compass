import { supabase } from "@/integrations/supabase/client";
import {
  generateAnalysis,
  markets,
  weightedScore,
  statuses,
  type Analysis,
  type Evaluation,
} from "./model";

export function storageError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "42P01" || code === "PGRST205")
    return "Market tables are not installed. Ask the project maintainer to apply the Week 7 migration to the existing Supabase project.";
  if (code === "42501")
    return "You do not have permission to modify this record. Sign in again or contact the project maintainer.";
  return "Cloud storage could not complete the request. Check your connection and session, then retry. Your unsaved inputs remain in this form.";
}
export async function loadWorkspace(userId: string) {
  const [evaluations, analyses] = await Promise.all([
    supabase
      .from("opportunity_evaluations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("market_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  if (evaluations.error) throw evaluations.error;
  if (analyses.error) throw analyses.error;
  return {
    evaluations: evaluations.data as unknown as Evaluation[],
    analyses: analyses.data as unknown as Analysis[],
  };
}
export async function saveEvaluation(value: Evaluation) {
  weightedScore(value.scores);
  if (
    !markets.some((m) => m.id === value.market_id) ||
    !statuses.includes(value.status) ||
    value.notes.length > 3000
  )
    throw new Error("Invalid evaluation.");
  const { data, error } = await supabase
    .from("opportunity_evaluations")
    .upsert(value, { onConflict: "user_id,market_id" })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Evaluation;
}
export async function saveAnalysis(value: Analysis) {
  const market = markets.find((m) => m.id === value.market_id);
  if (!market) throw new Error("Unknown market.");
  const report = generateAnalysis(market, value.scores, value.assumptions);
  const { data, error } = await supabase
    .from("market_analyses")
    .insert({ ...value, report })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Analysis;
}
