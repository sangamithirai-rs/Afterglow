import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(experienceId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setPhotos([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('experience_id', experienceId)
      .order('position', { ascending: true })

    // On failure keep whatever is already on screen rather than showing an
    // empty list that looks like the data was deleted.
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPhotos(data ?? [])
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

  return { photos, loading, error, refetch }
}
