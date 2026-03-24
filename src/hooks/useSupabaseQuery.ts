import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/** Shape returned by Supabase PostgREST query builders. */
interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * Wraps TanStack Query's useQuery with a Supabase query builder.
 *
 * Example:
 *   useSupabaseQuery(
 *     queryKeys.workouts.list(userId),
 *     () => supabase.from("workouts").select("*").eq("user_id", userId)
 *   );
 */
export function useSupabaseQuery<T>(
  queryKey: QueryKey,
  queryFn: () => PromiseLike<SupabaseResponse<T[]>>,
  options?: Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return (data ?? []) as T[];
    },
    ...options,
  });
}

/**
 * Fetch a single row by id.
 *
 * Example:
 *   useSupabaseQuerySingle(
 *     queryKeys.workouts.detail(id),
 *     () => supabase.from("workouts").select("*").eq("id", id).single()
 *   );
 */
export function useSupabaseQuerySingle<T>(
  queryKey: QueryKey,
  queryFn: () => PromiseLike<SupabaseResponse<T>>,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      if (!data) throw new Error("Not found");
      return data;
    },
    ...options,
  });
}

export { supabase };
