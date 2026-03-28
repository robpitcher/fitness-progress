import { queryKeys } from "./queryKeys";
import { useSupabaseQuery, supabase } from "./useSupabaseQuery";
import type { Category } from "../types";

/**
 * Fetches both default categories (user_id IS NULL)
 * and the current user's custom categories.
 */
export function useCategories(userId: string | undefined) {
  return useSupabaseQuery<Category>(
    queryKeys.categories.list(userId),
    () =>
      supabase
        .from("categories")
        .select("*")
        .or(userId ? `user_id.is.null,user_id.eq.${userId}` : "user_id.is.null")
        .order("name"),
    { enabled: !!userId },
  );
}
