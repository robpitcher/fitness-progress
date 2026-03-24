import { supabase } from "../lib/supabase";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Exercise, ExerciseInsert } from "../types";

export function useCreateExercise() {
  return useSupabaseMutation<Exercise, ExerciseInsert>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("exercises")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Exercise;
    },
    invalidateKeys: [queryKeys.exercises.all],
  });
}
