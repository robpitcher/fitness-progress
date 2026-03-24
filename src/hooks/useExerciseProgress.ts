import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { supabase } from "../lib/supabase";

export interface ProgressDataPoint {
  date: string;
  maxWeight: number;
}

interface SetRow {
  weight: number | null;
  workout_exercises: {
    exercise_id: string;
    workouts: {
      date: string;
    };
  };
}

/**
 * Fetches exercises that the user has actually logged sets for.
 */
export function useLoggedExercises(userId: string | undefined) {
  return useQuery<{ id: string; name: string }[], Error>({
    queryKey: queryKeys.exerciseProgress.exerciseList(userId ?? ""),
    queryFn: async () => {
      // Get distinct exercise IDs from workout_exercises belonging to the user's workouts
      const { data, error } = await supabase
        .from("workout_exercises")
        .select("exercise_id, exercises(id, name), workouts!inner(user_id)")
        .eq("workouts.user_id", userId!);

      if (error) throw error;

      // Deduplicate exercises
      const seen = new Set<string>();
      const exercises: { id: string; name: string }[] = [];
      for (const row of data ?? []) {
        const ex = row.exercises as unknown as { id: string; name: string } | null;
        if (ex && !seen.has(ex.id)) {
          seen.add(ex.id);
          exercises.push({ id: ex.id, name: ex.name });
        }
      }
      return exercises.sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!userId,
  });
}

/**
 * Fetches set data for a specific exercise over time and aggregates
 * to max weight per workout date.
 */
export function useExerciseProgress(exerciseId: string | undefined) {
  return useQuery<ProgressDataPoint[], Error>({
    queryKey: queryKeys.exerciseProgress.detail(exerciseId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select(
          "weight, workout_exercises!inner(exercise_id, workouts!inner(date))"
        )
        .eq("workout_exercises.exercise_id", exerciseId!);

      if (error) throw error;

      // Aggregate max weight per date
      const dateMap = new Map<string, number>();
      for (const row of (data ?? []) as unknown as SetRow[]) {
        const date = row.workout_exercises.workouts.date;
        const weight = row.weight ?? 0;
        const current = dateMap.get(date) ?? 0;
        if (weight > current) {
          dateMap.set(date, weight);
        }
      }

      return Array.from(dateMap.entries())
        .map(([date, maxWeight]) => ({ date, maxWeight }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!exerciseId,
  });
}
