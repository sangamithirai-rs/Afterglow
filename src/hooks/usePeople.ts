import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

import type { Person } from '../types'

export function usePeople(experienceId: string | undefined) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!experienceId) {
      setPeople([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('people')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPeople(data ?? [])
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

  return { people, loading, error, refetch }
}
