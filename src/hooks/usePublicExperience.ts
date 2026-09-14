import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Experience, Photo, Song, TimelineEntry, Person } from '../types'

interface PublicExperienceData {
  experience: Experience
  photos: Photo[]
  songs: Song[]
  timelineEntries: TimelineEntry[]
  people: Person[]
}

export function usePublicExperience(slug: string | undefined) {
  const [data, setData] = useState<PublicExperienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError('This experience could not be found.')
      return
    }

    const experienceSlug = slug
    let isMounted = true

    async function fetchAll() {
      const { data: experience, error: experienceError } = await supabase
        .from('experiences')
        .select('*')
        .eq('share_slug', experienceSlug)
        .single()

      if (!isMounted) return

      if (experienceError || !experience) {
        setError('This experience could not be found, or is not available to you.')
        setLoading(false)
        return
      }

      const [photosRes, songsRes, timelineRes, peopleRes] = await Promise.all([
        supabase.from('photos').select('*').eq('experience_id', experience.id).order('position'),
        supabase.from('songs').select('*').eq('experience_id', experience.id).order('position'),
        supabase.from('timeline_entries').select('*').eq('experience_id', experience.id).order('position'),
        supabase.from('people').select('*').eq('experience_id', experience.id).order('created_at'),
      ])

      if (!isMounted) return

      setData({
        experience,
        photos: photosRes.data ?? [],
        songs: songsRes.data ?? [],
        timelineEntries: timelineRes.data ?? [],
        people: peopleRes.data ?? [],
      })
      setLoading(false)
    }

    fetchAll()

    return () => {
      isMounted = false
    }
  }, [slug])

  return { data, loading, error }
}