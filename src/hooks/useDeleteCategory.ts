import { supabase } from "../lib/supabase";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";

export function useDeleteCategory() {
  return useSupabaseMutation<void, string>({
    mutationFn: async (categoryId) => {
      // First, set category_id to null for all exercises using this category
      const { error: updateError } = await supabase
        .from("exercises")
        .update({ category_id: null, category: null })
        .eq("category_id", categoryId);

      if (updateError) throw updateError;

      // Then delete the category
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (deleteError) throw deleteError;
    },
    invalidateKeys: [queryKeys.categories.all, queryKeys.exercises.all],
  });
}
