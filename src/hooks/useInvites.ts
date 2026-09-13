import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ExperienceInvite } from '../types'

export function useInvites(experienceId: string | undefined) {
  const [invites, setInvites] = useState<ExperienceInvite[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!experienceId) return
    const { data } = await supabase
      .from('experience_invites')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at')
    setInvites(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [experienceId])

  return { invites, loading, refetch }
}