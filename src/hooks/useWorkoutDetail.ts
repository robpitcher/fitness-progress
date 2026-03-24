import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "./queryKeys";
import { useAuth } from "./useAuth";
import type { Workout, Exercise, Set } from "../types";

export interface WorkoutDetailExercise {
  id: string;
  order: number;
  exercise: Exercise;
  sets: Set[];
}

export interface WorkoutDetail {
  workout: Workout;
  exercises: WorkoutDetailExercise[];
}

/**
 * Fetch the full workout detail for a specific date, including
 * all exercises and their sets.
 */
export function useWorkoutDetail(date: string | null) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<WorkoutDetail | null, Error>({
    queryKey: queryKeys.workouts.byDate(userId ?? "", date ?? ""),
    queryFn: async () => {
      const { data: workouts, error: wErr } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId!)
        .eq("date", date!)
        .limit(1);

      if (wErr) throw wErr;
      if (!workouts || workouts.length === 0) return null;

      const workout = workouts[0] as Workout;

      const { data: weRows, error: weErr } = await supabase
        .from("workout_exercises")
        .select("*, exercises(*)")
        .eq("workout_id", workout.id)
        .order('"order"', { ascending: true });

      if (weErr) throw weErr;

      const weIds = (weRows ?? []).map((we: { id: string }) => we.id);
      const setsMap: Record<string, Set[]> = {};

      if (weIds.length > 0) {
        const { data: setsData, error: sErr } = await supabase
          .from("sets")
          .select("*")
          .in("workout_exercise_id", weIds)
          .order("set_number", { ascending: true });

        if (sErr) throw sErr;

        for (const s of (setsData ?? []) as Set[]) {
          if (!setsMap[s.workout_exercise_id]) {
            setsMap[s.workout_exercise_id] = [];
          }
          setsMap[s.workout_exercise_id].push(s);
        }
      }

      const exercises: WorkoutDetailExercise[] = (weRows ?? []).map(
        (we: { id: string; order: number; exercises: Exercise }) => ({
          id: we.id,
          order: we.order,
          exercise: we.exercises,
          sets: setsMap[we.id] ?? [],
        }),
      );

      return { workout, exercises };
    },
    enabled: !!userId && !!date,
  });
}
