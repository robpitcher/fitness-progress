import { supabase } from "../lib/supabase";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { Category, CategoryInsert } from "../types";

export function useCreateCategory() {
  return useSupabaseMutation<Category, CategoryInsert>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    invalidateKeys: [queryKeys.categories.all],
  });
}
