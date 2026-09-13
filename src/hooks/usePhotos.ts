import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(experienceId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!experienceId) return
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })
    setPhotos(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [experienceId])

  return { photos, loading, refetch }
}