import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePublicExperience } from '../hooks/usePublicExperience'

export function PublicExperiencePage() {
  const { slug } = useParams<{ slug: string }>()

  const { user, loading: authLoading } = useAuth()

  console.log('AUTH:', {
    loading: authLoading,
    email: user?.email,
    authenticated: !!user,
  })

  const { data, loading, error } = usePublicExperience(slug, authLoading)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  useEffect(() => {
    if (selectedPhotoIndex === null || !data?.photos.length) return

    const photos = data.photos

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null)
      }

      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((current) =>
          current === null ? null : (current + 1) % photos.length
        )
      }

      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((current) =>
          current === null
            ? null
            : (current - 1 + photos.length) % photos.length
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhotoIndex, data])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink-soft">
        Loading...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
        <p className="font-serif text-2xl text-ink">Not found</p>
        <p className="text-ink-soft">
          {error ?? 'This experience does not exist.'}
        </p>
      </div>
    )
  }

  const { experience, photos, songs, timelineEntries, people } = data

  return (
    <div className="min-h-screen bg-bg">
      {/* Cover */}
      <div className="relative flex h-[50vh] min-h-[280px] items-end overflow-hidden sm:h-[60vh]">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--bg)_70%)] opacity-30" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="relative z-10 px-6 pb-8 sm:pb-10 md:px-16">
          <h1 className="font-serif text-3xl font-medium text-white sm:text-4xl md:text-6xl">
            {experience.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {(experience.event_date || experience.location) && (
          <p className="text-center text-sm uppercase tracking-wide text-ink-soft">
            {experience.event_date}
            {experience.event_date && experience.location && ' · '}
            {experience.location}
          </p>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
              Photos
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group aspect-square overflow-hidden rounded-lg border border-border text-left"
                >
                  <img
                    src={photo.storage_path}
                    alt={photo.caption ?? ''}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timelineEntries.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
              Timeline
            </h2>

            <div className="space-y-6 border-l border-border pl-6">
              {timelineEntries.map((entry) => (
                <div key={entry.id}>
                  {entry.entry_date && (
                    <p className="text-xs uppercase tracking-wide text-accent">
                      {entry.entry_date}
                    </p>
                  )}

                  <p className="mt-1 font-medium text-ink">
                    {entry.title}
                  </p>

                  {entry.note && (
                    <p className="mt-1 text-sm text-ink-soft">
                      {entry.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* People */}
        {people.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
              People
            </h2>

            <div className="flex flex-wrap gap-2">
              {people.map((person) => (
                <span
                  key={person.id}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink"
                >
                  {person.name}

                  {person.relationship && (
                    <span className="text-ink-soft">
                      {' · '}
                      {person.relationship}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Songs */}
        {songs.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
              Songs
            </h2>

            <ul className="space-y-2">
              {songs.map((song) => (
                <li key={song.id} className="text-ink">
                  {song.title}

                  {song.artist && (
                    <span className="text-ink-soft">
                      {' — '}
                      {song.artist}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Description */}
        {experience.description && (
          <section className="mt-12 border-t border-border pt-10 text-center sm:mt-16 sm:pt-12">
            <p className="font-serif text-lg italic leading-relaxed text-ink-soft sm:text-xl">
              &ldquo;{experience.description}&rdquo;
            </p>
          </section>
        )}
      </div>

      {/* Fullscreen Photo Viewer */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20"
            aria-label="Close photo viewer"
          >
            ×
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()

              setSelectedPhotoIndex(
                (selectedPhotoIndex - 1 + photos.length) % photos.length
              )
            }}
            className="absolute left-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:left-6"
            aria-label="Previous photo"
          >
            ‹
          </button>

          {/* Image */}
          <div
            className="flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex].storage_path}
              alt={photos[selectedPhotoIndex].caption ?? ''}
              className="max-h-[78vh] max-w-full rounded-lg object-contain"
            />

            {photos[selectedPhotoIndex].caption && (
              <p className="mt-4 text-center text-sm text-white/80">
                {photos[selectedPhotoIndex].caption}
              </p>
            )}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()

              setSelectedPhotoIndex(
                (selectedPhotoIndex + 1) % photos.length
              )
            }}
            className="absolute right-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:right-6"
            aria-label="Next photo"
          >
            ›
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
            {selectedPhotoIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  )
}