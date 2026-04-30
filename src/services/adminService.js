import { supabase } from "../lib/supabase";

export async function getAllHydrationLogs() {
  const { data, error } = await supabase
    .from("hydration_logs")
    .select("id, user_id, log_date, tumblers, liters, mood, note, daily_goal_liters, streak_count, created_at")
    .order("log_date", { ascending: false });

  if (error) throw error;
  return data || [];
}
