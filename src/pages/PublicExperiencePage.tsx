import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePublicExperience } from '../hooks/usePublicExperience'
import { MemoryReplay } from '../components/experience/MemoryReplay'

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
  const [replayOpen, setReplayOpen] = useState(false)
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
      {/* Hero */}
<section className="relative min-h-[78vh] overflow-hidden">
  {experience.cover_image_url ? (
    <img
      src={experience.cover_image_url}
      alt={experience.title}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--bg)_55%,var(--surface)_100%)]" />
  )}

  {/* Cinematic overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/80" />

  {/* Hero content */}
  <div className="relative z-10 flex min-h-[78vh] items-end">
    <div className="w-full px-6 pb-12 sm:px-10 sm:pb-16 md:px-16 md:pb-20">
      <div className="mx-auto max-w-5xl">
        {(experience.event_date || experience.location) && (
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/70 sm:text-sm">
            {experience.event_date}
            {experience.event_date && experience.location && '  ·  '}
            {experience.location}
          </p>
        )}

        <h1 className="max-w-4xl font-serif text-4xl font-medium leading-[1.05] text-white sm:text-5xl md:text-7xl lg:text-8xl">
          {experience.title}
        </h1>

       {experience.description && (
  <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-white/80 sm:text-xl md:text-2xl">
    &ldquo;{experience.description}&rdquo;
  </p>
)}

<button
  type="button"
  onClick={() => setReplayOpen(true)}
  className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/85"
>
  Relive this →
</button>

<div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
          <span>Afterglow</span>
          <span className="h-px w-8 bg-white/30" />
          <span>A memory worth keeping</span>
        </div>
      </div>
    </div>
  </div>
</section>

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
  <section className="mt-16 sm:mt-24">
    <div className="mb-7 flex items-end justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Memories
        </p>
        <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
          Moments worth keeping
        </h2>
      </div>

      <p className="hidden text-sm text-ink-soft sm:block">
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {photos.slice(0, 5).map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => setSelectedPhotoIndex(index)}
          className={`group relative overflow-hidden rounded-xl border border-border bg-surface text-left ${
            index === 0 && photos.length > 1
              ? 'sm:row-span-2 sm:aspect-[4/5]'
              : 'aspect-[4/3]'
          }`}
        >
          <img
            src={photo.storage_path}
            alt={photo.caption ?? ''}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

          {photo.caption && (
            <p className="absolute bottom-4 left-4 right-4 translate-y-2 text-sm text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {photo.caption}
            </p>
          )}
        </button>
      ))}
    </div>

    {photos.length > 5 && (
      <button
        type="button"
       onClick={() => setSelectedPhotoIndex(0)}
        className="mt-3 w-full rounded-xl border border-border bg-surface py-3 text-sm font-medium text-ink transition hover:border-accent-soft hover:bg-surface/80"
      >
        View all {photos.length} photos
      </button>
    )}
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
      {replayOpen && (
       <MemoryReplay
          experience={experience}
          photos={photos}
          songs={songs}
          timelineEntries={timelineEntries}
          people={people}
          onClose={() => setReplayOpen(false)}
        />
      )}
    </div>
  )
}