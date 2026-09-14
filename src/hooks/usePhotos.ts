import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(experienceId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setPhotos([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    setPhotos(data ?? [])
    setLoading(false)
  }, [experienceId])
useEffect(() => {
  const load = async () => {
    await refetch()
  }

  load()
}, [refetch])

  return { photos, loading, refetch }
}