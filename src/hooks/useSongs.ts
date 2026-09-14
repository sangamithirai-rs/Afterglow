import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Song } from '../types'

export function useSongs(experienceId: string | undefined) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setSongs([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    setSongs(data ?? [])
    setLoading(false)
  }, [experienceId])

useEffect(() => {
  const load = async () => {
    await refetch()
  }

  load()
}, [refetch])

  return { songs, loading, refetch }
}