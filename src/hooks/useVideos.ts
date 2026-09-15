import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Video = Database['public']['Tables']['videos']['Row']

export function useVideos(experienceId: string) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async () => {
    if (!experienceId) return

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data) {
      setVideos(data)
    }

    setLoading(false)
  }, [experienceId])

  useEffect(() => {
    // This effect synchronizes React state with the external Supabase query.
    // The lint rule cannot infer that the state updates happen asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVideos()
  }, [fetchVideos])

  return {
    videos,
    loading,
    refetch: fetchVideos,
  }
}