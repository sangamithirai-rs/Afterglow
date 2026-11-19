import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

import type { ExperienceInvite } from '../types'

export function useInvites(experienceId: string | undefined) {
  const [invites, setInvites] = useState<ExperienceInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setInvites([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('experience_invites')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setInvites(data ?? [])
      setError(null)
    }

    setLoading(false)
  }, [experienceId])

  useEffect(() => {
    const load = async () => {
      await refetch()
    }

    load()
  }, [refetch])

  return { invites, loading, error, refetch }
}
