import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Workout, WorkoutExercise, Exercise, Set } from "../types";

// Joined shape returned when selecting workout_exercises with exercise data
export interface WorkoutExerciseWithExercise extends WorkoutExercise {
  exercises: Exercise;
}

// Shape for workout summary: exercise with all its sets
export interface WorkoutSummaryExercise {
  order: number;
  name: string;
  category: string | null;
  sets: Pick<Set, "set_number" | "reps" | "weight">[];
}

export function todayDateString(): string {
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


/** Fetch a workout for the user on a specific date. */
export function useWorkoutByDate(
  userId: string | undefined,
  date: string | undefined,
) {
  return useSupabaseQuery<Workout>(
    queryKeys.workouts.byDate(userId ?? "", date ?? ""),
    () =>
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId!)
        .eq("date", date!),
    { enabled: !!userId && !!date },
  );
}

/** Create a new workout for today or a specified date. */
export function useCreateWorkout() {
  return useSupabaseMutation<Workout, { user_id: string; date?: string }>({
    mutationFn: async ({ user_id, date }) => {
      const workoutDate = date ?? todayDateString();
      let startedAt: string;
      if (!date) {
        startedAt = new Date().toISOString();
      } else {
        const today = todayDateString();
        if (date < today) {
          startedAt = `${date}T00:00:00.000Z`;
        } else if (date === today) {
          startedAt = new Date().toISOString();
        } else {
          throw new Error("Workout date cannot be in the future");
        }
      }
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          user_id,
          date: workoutDate,
          started_at: startedAt,
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

/** Mark a workout as completed by setting completed_at. */
export function useCompleteWorkout() {
  return useSupabaseMutation<Workout, { id: string }>({
    mutationFn: async ({ id }) => {
      const { data, error } = await supabase
        .from("workouts")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Workout;
    },
    invalidateKeys: [queryKeys.workouts.all],
  });
}

/** Fetch workout summary: exercises with their sets for a completed workout. */
export function useWorkoutSummary(workoutId: string | undefined) {
  return useQuery<WorkoutSummaryExercise[]>({
    queryKey: ["workoutSummary", workoutId] as const,
    queryFn: async () => {
      const { data: exercises, error: exError } = await supabase
        .from("workout_exercises")
        .select('id, "order", exercises(name, category)')
        .eq("workout_id", workoutId!)
        .order('"order"', { ascending: true });

      if (exError) throw exError;
      if (!exercises || exercises.length === 0) return [];

      const weIds = exercises.map((e) => e.id);
      const { data: sets, error: setsError } = await supabase
        .from("sets")
        .select("workout_exercise_id, set_number, reps, weight")
        .in("workout_exercise_id", weIds)
        .order("set_number", { ascending: true });

      if (setsError) throw setsError;

      const setsByWe = new Map<
        string,
        Pick<Set, "set_number" | "reps" | "weight">[]
      >();
      for (const s of sets ?? []) {
        const list = setsByWe.get(s.workout_exercise_id) ?? [];
        list.push({ set_number: s.set_number, reps: s.reps, weight: s.weight });
        setsByWe.set(s.workout_exercise_id, list);
      }

      return exercises.map((e) => {
        const ex = e.exercises as unknown as {
          name: string;
          category: string | null;
        };
        return {
          order: e.order,
          name: ex.name,
          category: ex.category,
          sets: setsByWe.get(e.id) ?? [],
        };
      });
    },
    enabled: !!workoutId,
    staleTime: 5 * 60 * 1000,
  });
}
