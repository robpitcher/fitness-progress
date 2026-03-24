import { useSupabaseQuery } from "./useSupabaseQuery";
import { queryKeys } from "./queryKeys";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Workout } from "../types";

export function useWorkoutDates(year: number, month: number) {
  const { user } = useAuth();
  const userId = user?.id;

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endYear = month === 11 ? year + 1 : year;
  const endMonth = month === 11 ? 1 : month + 2;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  return useSupabaseQuery<Pick<Workout, "date">>(
    queryKeys.workouts.dates(userId ?? "", monthKey),
    () =>
      supabase
        .from("workouts")
        .select("date")
        .eq("user_id", userId!)
        .gte("date", startDate)
        .lt("date", endDate),
    { enabled: !!userId },
  );
}
