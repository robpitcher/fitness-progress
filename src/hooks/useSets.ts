import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Set, SetInsert, SetUpdate } from "../types";

/** Fetch all sets for a workout exercise, ordered by set_number. */
export function useSets(workoutExerciseId: string | undefined) {
  return useSupabaseQuery<Set>(
    queryKeys.sets.list(workoutExerciseId ?? ""),
    () =>
      supabase
        .from("sets")
        .select("*")
        .eq("workout_exercise_id", workoutExerciseId!)
        .order("set_number", { ascending: true }),
    { enabled: !!workoutExerciseId },
  );
}

/** Insert a new set row. */
export function useAddSet() {
  return useSupabaseMutation<Set, SetInsert>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("sets")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Set;
    },
    invalidateKeys: [queryKeys.sets.all],
  });
}

/** Update an existing set (real-time save on field change). */
export function useUpdateSet() {
  return useSupabaseMutation<Set, SetUpdate>({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from("sets")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Set;
    },
    invalidateKeys: [queryKeys.sets.all],
  });
}

/** Delete a set by id. */
export function useDeleteSet() {
  return useSupabaseMutation<void, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("sets").delete().eq("id", id);
      if (error) throw error;
    },
    invalidateKeys: [queryKeys.sets.all],
  });
}

/** Shape returned by the previous-performance query. */
export interface PreviousSetData {
  set_number: number;
  reps: number | null;
  weight: number | null;
}

/**
 * Fetch previous performance for an exercise — the sets from the most recent
 * *other* workout containing this exercise (excludes current workout).
 */
export function usePreviousPerformance(
  exerciseId: string | undefined,
  currentWorkoutId: string | undefined,
  userId: string | undefined,
) {
  return useQuery<PreviousSetData[]>({
    queryKey: [
      "previousPerformance",
      exerciseId,
      currentWorkoutId,
      userId,
    ] as const,
    queryFn: async () => {
      // Find the most recent workout_exercise for this exercise that is NOT
      // in the current workout, scoped to this user.
      const { data: prevWe, error: weError } = await supabase
        .from("workout_exercises")
        .select("id, workouts!inner(id, date, user_id)")
        .eq("exercise_id", exerciseId!)
        .eq("workouts.user_id", userId!)
        .neq("workout_id", currentWorkoutId!)
        .order("workouts(date)", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (weError) throw weError;
      if (!prevWe) return [];

      const { data: sets, error: setsError } = await supabase
        .from("sets")
        .select("set_number, reps, weight")
        .eq("workout_exercise_id", prevWe.id)
        .order("set_number", { ascending: true });

      if (setsError) throw setsError;
      return (sets ?? []) as PreviousSetData[];
    },
    enabled: !!exerciseId && !!currentWorkoutId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
