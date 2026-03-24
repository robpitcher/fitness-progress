import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

interface SupabaseMutationOptions<TData, TVariables> {
  /** The async function that performs the Supabase operation. */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate on success. */
  invalidateKeys?: QueryKey[];
  /** Additional TanStack Query mutation options. */
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
}

/**
 * Wraps TanStack Query's useMutation with automatic cache invalidation.
 *
 * Example:
 *   useSupabaseMutation<Workout, WorkoutInsert>({
 *     mutationFn: async (input) => {
 *       const { data, error } = await supabase
 *         .from("workouts")
 *         .insert(input)
 *         .select()
 *         .single();
 *       if (error) throw error;
 *       return data;
 *     },
 *     invalidateKeys: [queryKeys.workouts.all],
 *   });
 */
export function useSupabaseMutation<TData, TVariables>({
  mutationFn,
  invalidateKeys = [],
  options,
}: SupabaseMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (...args) => {
      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        )
      );
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
