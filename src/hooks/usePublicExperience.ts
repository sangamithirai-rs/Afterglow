import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Experience,
  Photo,
  Song,
  TimelineEntry,
  Person,
  Video,
} from '../types'

interface PublicExperienceData {
  experience: Experience
  photos: Photo[]
  songs: Song[]
  timelineEntries: TimelineEntry[]
  people: Person[]
  videos: Video[]
}

export function usePublicExperience(
  slug: string | undefined,
  authLoading: boolean
) {
  const [data, setData] = useState<PublicExperienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchAll = async () => {
      if (!slug) {
        setData(null)
        setLoading(false)
        setError('This experience could not be found.')
        return
      }

      const experienceSlug = slug
      const isMounted = true
      setLoading(true)
      setError(null)

      const { data: experience, error: experienceError } = await supabase
        .from('experiences')
        .select('*')
        .eq('share_slug', experienceSlug)
        .single()

      if (!isMounted) return

      if (experienceError || !experience) {
        setData(null)
        setError(
          'This experience could not be found, or is not available to you.'
        )
        setLoading(false)
        return
      }

      const [
        photosRes,
        songsRes,
        timelineRes,
        peopleRes,
        videosRes,
      ] = await Promise.all([
        supabase
          .from('photos')
          .select('*')
          .eq('experience_id', experience.id)
          .order('position', { ascending: true }),

        supabase
          .from('songs')
          .select('*')
          .eq('experience_id', experience.id)
          .order('position', { ascending: true }),

        supabase
          .from('timeline_entries')
          .select('*')
          .eq('experience_id', experience.id)
          .order('position', { ascending: true }),

        supabase
          .from('people')
          .select('*')
          .eq('experience_id', experience.id)
          .order('created_at', { ascending: true }),

        supabase
          .from('videos')
          .select('*')
          .eq('experience_id', experience.id)
          .order('position', { ascending: true })
          .order('created_at', { ascending: true }),
      ])

      if (!isMounted) return

      setData({
        experience,
        photos: photosRes.data ?? [],
        songs: songsRes.data ?? [],
        timelineEntries: timelineRes.data ?? [],
        people: peopleRes.data ?? [],
        videos: videosRes.data ?? [],
      })

      setLoading(false)
    }

    fetchAll()
  }, [slug, authLoading])

  return { data, loading, error }
}