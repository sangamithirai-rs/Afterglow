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
        <p className="text-ink-soft">{error ?? 'This experience does not exist.'}</p>
      </div>
    )
  }

  const { experience, photos, songs, timelineEntries, people } = data

  return (
    <div className="min-h-screen bg-bg">
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

      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {(experience.event_date || experience.location) && (
          <p className="text-center text-sm uppercase tracking-wide text-ink-soft">
            {experience.event_date}
            {experience.event_date && experience.location && ' · '}
            {experience.location}
          </p>
        )}

        {photos.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Photos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={photo.storage_path} alt={photo.caption ?? ''} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {timelineEntries.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Timeline</h2>
            <div className="space-y-6 border-l border-border pl-6">
              {timelineEntries.map((entry) => (
                <div key={entry.id}>
                  {entry.entry_date && (
                    <p className="text-xs uppercase tracking-wide text-accent">{entry.entry_date}</p>
                  )}
                  <p className="mt-1 font-medium text-ink">{entry.title}</p>
                  {entry.note && <p className="mt-1 text-sm text-ink-soft">{entry.note}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {people.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">People</h2>
            <div className="flex flex-wrap gap-2">
              {people.map((person) => (
                <span
                  key={person.id}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink"
                >
                  {person.name}
                  {person.relationship && <span className="text-ink-soft"> · {person.relationship}</span>}
                </span>
              ))}
            </div>
          </section>
        )}

        {songs.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Songs</h2>
            <ul className="space-y-2">
              {songs.map((song) => (
                <li key={song.id} className="text-ink">
                  {song.title}
                  {song.artist && <span className="text-ink-soft"> — {song.artist}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {experience.description && (
          <section className="mt-12 border-t border-border pt-10 text-center sm:mt-16 sm:pt-12">
            <p className="font-serif text-lg italic leading-relaxed text-ink-soft sm:text-xl">
              &ldquo;{experience.description}&rdquo;
            </p>
          </section>
        )}
      </div>
    </div>
  )
}