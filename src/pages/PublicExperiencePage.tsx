import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePublicExperience } from '../hooks/usePublicExperience'
import { MemoryReplay } from '../components/experience/MemoryReplay'
import { supabase } from '../lib/supabase'

const SIGNED_URL_EXPIRY = 60 * 60

export function PublicExperiencePage() {
  const { slug } = useParams<{ slug: string }>()
  const { loading: authLoading } = useAuth()

  const { data, loading, error } = usePublicExperience(slug, authLoading)

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  )
  const [replayOpen, setReplayOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (selectedPhotoIndex === null || !data?.photos.length) return

    const photos = data.photos

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null)
      }

      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((current) =>
          current === null ? null : (current + 1) % photos.length,
        )
      }

      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((current) =>
          current === null
            ? null
            : (current - 1 + photos.length) % photos.length,
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhotoIndex, data])

  useEffect(() => {
    let cancelled = false

    async function loadVideoUrls() {
      if (!data?.videos.length) {
        setVideoUrls({})
        return
      }

      const urls: Record<string, string> = {}

      await Promise.all(
        data.videos.map(async (video) => {
          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              .from('experience-videos')
              .createSignedUrl(video.storage_path, SIGNED_URL_EXPIRY)

          if (!signedUrlError && signedUrlData?.signedUrl) {
            urls[video.id] = signedUrlData.signedUrl
          }
        }),
      )

      if (!cancelled) {
        setVideoUrls(urls)
      }
    }

    loadVideoUrls()

    return () => {
      cancelled = true
    }
  }, [data?.videos])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="font-serif text-lg italic text-ink-soft">
          Loading memory...
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Afterglow
        </p>

        <h1 className="font-serif text-3xl font-medium text-ink">
          Memory not found
        </h1>

        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          {error ?? 'This experience does not exist.'}
        </p>
      </div>
    )
  }

  const {
    experience,
    photos,
    songs,
    timelineEntries,
    people,
    videos,
  } = data

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: experience.title,
          text: 'A memory worth keeping.',
          url,
        })
      } catch {
        // User cancelled the share sheet.
      }

      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)

      window.setTimeout(() => {
        setShareCopied(false)
      }, 2000)
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative min-h-[68vh] overflow-hidden sm:min-h-[82vh]">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--bg)_55%,var(--surface)_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/85" />

        <div className="relative z-10 flex min-h-[76vh] items-end sm:min-h-[82vh]">
          <div className="w-full px-6 pb-10 sm:px-10 sm:pb-14 md:px-16 md:pb-20">
            <div className="mx-auto max-w-5xl">
              <div className="max-w-4xl">
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-white/70 sm:text-sm">
                  Afterglow
                </p>

                <h1 className="font-serif text-3xl font-medium leading-[1.05] text-white sm:text-5xl md:text-7xl lg:text-8xl">
                  {experience.title}
                </h1>

                {(experience.event_date || experience.location) && (
                  <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                    {experience.event_date}
                    {experience.event_date &&
                      experience.location &&
                      '  ·  '}
                    {experience.location}
                  </p>
                )}

                {experience.description && (
                  <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-white/80 sm:text-xl md:text-2xl">
                    &ldquo;{experience.description}&rdquo;
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setReplayOpen(true)}
                  className="mt-7 inline-flex w-full justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/85 sm:mt-8 sm:w-auto"
                >
                  Relive this →
                </button>
              </div>

              <div className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/50 sm:text-xs">
                <span>A memory worth keeping</span>
                <span className="h-px w-8 bg-white/30" />
                <span>
                  {photos.length + videos.length}{' '}
                  {photos.length + videos.length === 1
                    ? 'moment'
                    : 'moments'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20 md:py-24">
        {/* Introduction */}
        <section className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            The experience
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            A moment, kept intact.
          </h2>

          {(experience.event_date || experience.location) && (
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-soft">
              {experience.event_date}
              {experience.event_date && experience.location && ' · '}
              {experience.location}
            </p>
          )}
        </section>

        {/* Photos */}
        {photos.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 sm:mt-24 sm:pt-16">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  01
                </p>

                <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                  The moments
                </h2>
              </div>

              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                {photos.length}{' '}
                {photos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {photos.slice(0, 5).map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`group relative overflow-hidden border border-border bg-surface text-left ${
                    index === 0 && photos.length > 1
                      ? 'sm:row-span-2 sm:aspect-[4/5]'
                      : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={photo.storage_path}
                    alt={photo.caption ?? ''}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

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
                className="mt-3 w-full border border-border py-3 text-xs font-medium uppercase tracking-[0.14em] text-ink transition hover:border-accent-soft hover:bg-surface"
              >
                View all {photos.length} photos →
              </button>
            )}
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  02
                </p>

                <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                  Moving moments
                </h2>
              </div>

              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                {videos.length}{' '}
                {videos.length === 1 ? 'video' : 'videos'}
              </p>
            </div>

            <div className="space-y-6">
              {videos.map((video) => {
                const videoUrl = videoUrls[video.id]

                return (
                  <div
                    key={video.id}
                    className="overflow-hidden border border-border bg-black"
                  >
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="block max-h-[75vh] w-full object-contain"
                      />
                    ) : (
                      <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-white/70">
                        Loading video...
                      </div>
                    )}

                    {video.caption && (
                      <p className="border-t border-white/10 px-4 py-3 text-sm text-white/80">
                        {video.caption}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timelineEntries.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                03
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                How it unfolded
              </h2>
            </div>

            <div className="max-w-3xl">
              <div className="space-y-0">
                {timelineEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid gap-2 border-t border-border py-6 sm:grid-cols-[140px_1fr] sm:gap-8"
                  >
                    <div>
                      {entry.entry_date && (
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
                          {entry.entry_date}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-serif text-xl font-medium text-ink">
                        {entry.title}
                      </p>

                      {entry.note && (
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* People */}
        {people.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                04
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                Who was there
              </h2>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-5">
              {people.map((person) => (
                <div key={person.id}>
                  <p className="font-serif text-lg font-medium text-ink">
                    {person.name}
                  </p>

                  {person.relationship && (
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-soft">
                      {person.relationship}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Songs */}
        {songs.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                05
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                The soundtrack
              </h2>
            </div>

            <div className="max-w-2xl">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-baseline justify-between gap-6 py-4 ${
                    index !== 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <p className="font-serif text-lg text-ink">
                    {song.title}
                  </p>

                  {song.artist && (
                    <p className="text-sm text-ink-soft">
                      {song.artist}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Share */}
        <section className="mt-20 border-t border-border pt-14 text-center sm:mt-28 sm:pt-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Keep the memory close
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Share this memory
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            Let someone else relive this moment with you.
          </p>

          <button
            type="button"
            onClick={handleShare}
            className="mt-7 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-ink transition hover:border-accent-soft"
          >
            {shareCopied ? '✓ Link copied' : 'Share this memory'}
          </button>

          <p className="mt-4 text-xs text-ink-soft">
            Anyone with the link can view this experience.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-border pt-8 text-center sm:mt-24">
          <p className="font-serif text-lg text-ink">Afterglow</p>
          <p className="mt-1 text-xs text-ink-soft">
            A memory worth keeping.
          </p>
        </footer>
      </main>

      {/* Fullscreen Photo Viewer */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20"
            aria-label="Close photo viewer"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()

              setSelectedPhotoIndex(
                (selectedPhotoIndex - 1 + photos.length) % photos.length,
              )
            }}
            className="absolute left-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:left-6"
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div
            className="flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex].storage_path}
              alt={photos[selectedPhotoIndex].caption ?? ''}
              className="max-h-[78vh] max-w-full object-contain"
            />

            {photos[selectedPhotoIndex].caption && (
              <p className="mt-4 text-center text-sm text-white/80">
                {photos[selectedPhotoIndex].caption}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()

              setSelectedPhotoIndex(
                (selectedPhotoIndex + 1) % photos.length,
              )
            }}
            className="absolute right-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:right-6"
            aria-label="Next photo"
          >
            ›
          </button>

          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
            {selectedPhotoIndex + 1} / {photos.length}
          </p>
        </div>
      )}

      {/* Memory Replay */}
      {replayOpen && (
        <MemoryReplay
  experience={experience}
  photos={photos}
  songs={songs}
  timelineEntries={timelineEntries}
  people={people}
  videos={videos}
  videoUrls={videoUrls}
  onClose={() => setReplayOpen(false)}
/>
      )}
    </div>
  )
}