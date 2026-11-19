import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Song } from '../types'

export function useSongs(experienceId: string | undefined) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setSongs([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('songs')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSongs(data ?? [])
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

  return { songs, loading, error, refetch }
}
