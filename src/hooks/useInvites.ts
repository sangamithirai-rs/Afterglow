import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

import type { ExperienceInvite } from '../types'

export function useInvites(experienceId: string | undefined) {
  const [invites, setInvites] = useState<ExperienceInvite[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setInvites([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data } = await supabase
      .from('experience_invites')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at')

    setInvites(data ?? [])
    setLoading(false)
  }, [experienceId])

  useEffect(() => {
    const load = async () => {
      await refetch()
    }

    load()
  }, [refetch])

  return { invites, loading, refetch }
}