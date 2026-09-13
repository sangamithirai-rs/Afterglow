import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TimelineEntry } from '../types'

export function useTimelineEntries(experienceId: string | undefined) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!experienceId) return
    const { data } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [experienceId])

  return { entries, loading, refetch }
}