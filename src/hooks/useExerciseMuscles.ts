import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { queryKeys } from "./queryKeys";
import type { ExerciseMuscle } from "../types";

export function useExerciseMuscles(exerciseId: string | undefined) {
  return useSupabaseQuery<ExerciseMuscle>(
    queryKeys.exerciseMuscles.list(exerciseId ?? ""),
    () =>
      supabase
        .from("exercise_muscles")
        .select("*")
        .eq("exercise_id", exerciseId!)
        .order("muscle_role", { ascending: false }) // primary first, then secondary
        .order("muscle_name", { ascending: true }),
    { enabled: !!exerciseId },
  );
}
