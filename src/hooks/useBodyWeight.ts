import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { BodyWeight, BodyWeightUpdate } from "../types";

export function useBodyWeights(userId: string | undefined) {
  return useSupabaseQuery<BodyWeight>(
    queryKeys.bodyWeights.list(userId ?? ""),
    () =>
      supabase
        .from("body_weights")
        .select("*")
        .eq("user_id", userId!)
        .order("date", { ascending: false }),
    { enabled: !!userId },
  );
}

interface UpsertBodyWeightInput {
  user_id: string;
  date: string;
  weight: number;
}

export function useUpsertBodyWeight() {
  return useSupabaseMutation<BodyWeight, UpsertBodyWeightInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("body_weights")
        .upsert(input, { onConflict: "user_id,date" })
        .select()
        .single();
      if (error) throw error;
      return data as BodyWeight;
    },
    invalidateKeys: [queryKeys.bodyWeights.all],
  });
}

/** Update an existing body weight entry. */
export function useUpdateBodyWeight() {
  return useSupabaseMutation<BodyWeight, BodyWeightUpdate>({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from("body_weights")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as BodyWeight;
    },
    invalidateKeys: [queryKeys.bodyWeights.all],
  });
}

/** Delete a body weight entry by id. */
export function useDeleteBodyWeight() {
  return useSupabaseMutation<void, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("body_weights")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    invalidateKeys: [queryKeys.bodyWeights.all],
  });
}
