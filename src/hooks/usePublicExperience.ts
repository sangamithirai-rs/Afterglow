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

const NOT_FOUND_MESSAGE =
  'This experience could not be found, or is not available to you.'

export function usePublicExperience(
  slug: string | undefined,
  authLoading: boolean
) {
  const [data, setData] = useState<PublicExperienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    // Set to true on cleanup so a slow response for a previous slug can never
    // overwrite the state for the current one.
    let cancelled = false

    const fetchAll = async () => {
      if (!slug) {
        setData(null)
        setLoading(false)
        setError('This experience could not be found.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data: experience, error: experienceError } = await supabase
          .from('experiences')
          .select('*')
          .eq('share_slug', slug)
          .single()

        if (cancelled) return

        if (experienceError || !experience) {
          setData(null)
          setError(NOT_FOUND_MESSAGE)
          setLoading(false)
          return
        }

        const [photosRes, songsRes, timelineRes, peopleRes, videosRes] =
          await Promise.all([
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

        if (cancelled) return

        const failed = [
          photosRes,
          songsRes,
          timelineRes,
          peopleRes,
          videosRes,
        ].find((res) => res.error)

        if (failed?.error) {
          console.error('Failed to load experience content:', failed.error)
          setData(null)
          setError('Something went wrong while loading this memory.')
          setLoading(false)
          return
        }

        setData({
          experience,
          photos: photosRes.data ?? [],
          songs: songsRes.data ?? [],
          timelineEntries: timelineRes.data ?? [],
          people: peopleRes.data ?? [],
          videos: videosRes.data ?? [],
        })

        setLoading(false)
      } catch (err) {
        if (cancelled) return

        console.error('Failed to load experience:', err)
        setData(null)
        setError('Something went wrong while loading this memory.')
        setLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [slug, authLoading])

  return { data, loading, error }
}
