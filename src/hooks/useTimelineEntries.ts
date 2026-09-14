import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TimelineEntry } from '../types'

export function useTimelineEntries(experienceId: string | undefined) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    setEntries(data ?? [])
    setLoading(false)
  }, [experienceId])

   useEffect(() => {
    const load = async () => {
      await refetch()
    }

    load()
  }, [refetch])

  return { entries, loading, refetch }
}