import { supabase } from "../lib/supabase";
import { RECOMMENDED_GOAL_LITERS, TUMBLER_LITERS } from "../constants/hydration";
import { todayKey } from "../utils/date";

const hydrationSelect = "id, log_date, tumblers, liters, mood, note, daily_goal_liters, streak_count, created_at";

export function emptyLog(date = todayKey()) {
  return {
    id: null,
    log_date: date,
    tumblers: 0,
    liters: 0,
    mood: "",
    note: "",
    daily_goal_liters: RECOMMENDED_GOAL_LITERS,
    streak_count: 0,
  };
}

export async function getLogs() {
  const { data, error } = await supabase
    .from("hydration_logs")
    .select(hydrationSelect)
    .order("log_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertTodayLog({ userId, tumblers, mood, note, dailyGoalLiters, streakCount }) {
  const safeTumblers = Number(tumblers || 0);
  const payload = {
    user_id: userId,
    log_date: todayKey(),
    tumblers: safeTumblers,
    mood: mood || null,
    note: note || null,
    daily_goal_liters: dailyGoalLiters || RECOMMENDED_GOAL_LITERS,
    streak_count: streakCount || 0,
  };

  const { data, error } = await supabase
    .from("hydration_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select(hydrationSelect)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLog(id) {
  const { error } = await supabase.from("hydration_logs").delete().eq("id", id);
  if (error) throw error;
}
