import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Workout, WorkoutExercise, Exercise } from "../types";

// Joined shape returned when selecting workout_exercises with exercise data
export interface WorkoutExerciseWithExercise extends WorkoutExercise {
  exercises: Exercise;
}

function todayDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Fetch today's workout for the user (if any). */
export function useTodayWorkout(userId: string | undefined) {
  const today = todayDateString();
  return useSupabaseQuery<Workout>(
    [...queryKeys.workouts.list(userId ?? ""), today],
    () =>
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId!)
        .eq("date", today),
    { enabled: !!userId },
  );
}

/** Create a new workout for today. */
export function useCreateWorkout() {
  return useSupabaseMutation<Workout, { user_id: string }>({
    mutationFn: async ({ user_id }) => {
      const today = todayDateString();
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          user_id,
          date: today,
          started_at: new Date().toISOString(),
          completed_at: null,
          notes: null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Workout;
    },
    invalidateKeys: [queryKeys.workouts.all],
  });
}

/** Fetch exercises for a workout, joined with exercise details. */
export function useWorkoutExercises(workoutId: string | undefined) {
  return useSupabaseQuery<WorkoutExerciseWithExercise>(
    queryKeys.workoutExercises.list(workoutId ?? ""),
    () =>
      supabase
        .from("workout_exercises")
        .select("*, exercises(*)")
        .eq("workout_id", workoutId!)
        .order('"order"', { ascending: true }),
    { enabled: !!workoutId },
  );
}

/** Add an exercise to a workout. */
export function useAddWorkoutExercise() {
  return useSupabaseMutation<
    WorkoutExercise,
    { workout_id: string; exercise_id: string; order: number }
  >({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("workout_exercises")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutExercise;
    },
    invalidateKeys: [queryKeys.workoutExercises.all],
  });
}
