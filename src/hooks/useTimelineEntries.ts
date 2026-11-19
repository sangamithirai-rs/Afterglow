import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TimelineEntry } from '../types'

export function useTimelineEntries(experienceId: string | undefined) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setEntries([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setEntries(data ?? [])
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

  return { entries, loading, error, refetch }
}
