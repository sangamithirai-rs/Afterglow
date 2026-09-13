import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Song } from '../types'

export function useSongs(experienceId: string | undefined) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!experienceId) return
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })
    setSongs(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [experienceId])

  return { songs, loading, refetch }
}