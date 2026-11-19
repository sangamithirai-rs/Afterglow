import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Experience } from '../types'

export function useExperience(id: string | undefined) {
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const experienceId = id
    let isMounted = true

    async function fetchExperience() {
      const { data, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', experienceId)
        .single()

      if (!isMounted) return

      if (fetchError) {
        setExperience(null)
        setError(fetchError.message)
      } else {
        setError(null)
        setExperience(data)
      }

      setLoading(false)
    }

    fetchExperience()

    return () => {
      isMounted = false
    }
  }, [id])

  // With no id there is nothing to load. Derive that state instead of leaving
  // callers stuck on `loading: true` forever.
  if (!id) {
    return { experience: null, loading: false, error: null }
  }

  return { experience, loading, error }
}
