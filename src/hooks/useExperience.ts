import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Experience } from '../types'

export function useExperience(id: string | undefined) {
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

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
        setError(fetchError.message)
      } else {
        setExperience(data)
      }
      setLoading(false)
    }

    fetchExperience()

    return () => {
      isMounted = false
    }
  }, [id])

  return { experience, loading, error }
}