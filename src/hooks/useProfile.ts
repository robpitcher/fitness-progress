import { useAuth } from './useAuth'
import { useSupabaseQuerySingle } from './useSupabaseQuery'
import { useSupabaseMutation } from './useSupabaseMutation'
import { queryKeys } from './queryKeys'
import { supabase } from '../lib/supabase'
import type { Profile, ProfileUpdate } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const query = useSupabaseQuerySingle<Profile>(
    queryKeys.profiles.detail(userId),
    () => supabase.from('profiles').select('*').eq('id', userId).single(),
    { enabled: !!userId },
  )

  const mutation = useSupabaseMutation<Profile, ProfileUpdate>({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: updates.display_name })
        .eq('id', updates.id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    invalidateKeys: [queryKeys.profiles.all, queryKeys.profiles.detail(userId)],
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  }
}
