import { supabase } from "../lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useSupabaseMutation } from "./useSupabaseMutation";
import { queryKeys } from "./queryKeys";
import type { BodyWeight } from "../types";

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
