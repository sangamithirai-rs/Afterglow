import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Experience } from '../types'

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchExperiences() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        setExperiences([])
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setExperiences(data ?? [])
      }

      setLoading(false)
    }

    fetchExperiences()

    return () => {
      isMounted = false
    }
  }, [])

  return { experiences, loading, error }
}