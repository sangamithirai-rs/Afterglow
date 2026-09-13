import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Person } from '../types'

export function usePeople(experienceId: string | undefined) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!experienceId) return
    const { data } = await supabase
      .from('people')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: true })
    setPeople(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [experienceId])

  return { people, loading, refetch }
}