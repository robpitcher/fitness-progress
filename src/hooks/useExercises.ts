import { queryKeys } from "./queryKeys";
import { useSupabaseQuery, supabase } from "./useSupabaseQuery";
import type { Exercise } from "../types";

/**
 * Fetches both global library exercises (user_id IS NULL)
 * and the current user's custom exercises.
 */
export function useExercises(userId: string | undefined) {
  return useSupabaseQuery<Exercise>(
    queryKeys.exercises.list(userId),
    () =>
      supabase
        .from("exercises")
        .select("*")
        .or(userId ? `user_id.is.null,user_id.eq.${userId}` : "user_id.is.null")
        .order("name"),
    { enabled: !!userId },
  );
}
