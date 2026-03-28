import { supabase } from "../lib/supabase";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Category, CategoryUpdate } from "../types";

export function useUpdateCategory() {
  return useSupabaseMutation<Category, CategoryUpdate>({
    mutationFn: async (input) => {
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from("categories")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    invalidateKeys: [queryKeys.categories.all, queryKeys.exercises.all],
  });
}
