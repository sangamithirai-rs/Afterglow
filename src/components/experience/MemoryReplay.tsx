import { useEffect, useState } from 'react'
import type {
  Experience,
  Photo,
  Song,
  TimelineEntry,
  Person,
  Video,
} from '../../types'

interface MemoryReplayProps {
  experience: Experience
  photos: Photo[]
  songs: Song[]
  timelineEntries: TimelineEntry[]
  people: Person[]
  videos: Video[]
  videoUrls: Record<string, string>
  onClose: () => void
}

export function MemoryReplay({
  experience,
  photos,
  songs,
  timelineEntries,
  people,
  videos,
  videoUrls,
  onClose,
}: MemoryReplayProps) {
  const [step, setStep] = useState(0)

  const totalSteps =
    1 +
    photos.length +
    videos.length +
    timelineEntries.length +
    (people.length > 0 ? 1 : 0) +
    (songs.length > 0 ? 1 : 0) +
    1

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()

      if (e.key === 'ArrowRight') {
        setStep((current) => Math.min(current + 1, totalSteps - 1))
      }

      if (e.key === 'ArrowLeft') {
        setStep((current) => Math.max(current - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, totalSteps])

  const photoStart = 1
  const videoStart = photoStart + photos.length
  const timelineStart = videoStart + videos.length
  const peopleStep = timelineStart + timelineEntries.length
  const songsStep = peopleStep + (people.length > 0 ? 1 : 0)

  let content

  if (step === 0) {
    content = (
      <div className="w-full max-w-3xl text-center">
        {experience.cover_image_url && (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="mx-auto mb-6 max-h-[42vh] w-full object-cover sm:mb-8 sm:max-h-[48vh]"
          />
        )}

        {(experience.event_date || experience.location) && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 sm:text-xs sm:tracking-[0.25em]">
            {experience.event_date}
            {experience.event_date && experience.location && ' · '}
            {experience.location}
          </p>
        )}

        <h1 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-5xl md:text-6xl">
          {experience.title}
        </h1>

        <p className="mt-4 text-sm text-white/50">
          A memory worth keeping.
        </p>
      </div>
    )
  } else if (step >= photoStart && step < videoStart) {
    const photo = photos[step - photoStart]

    content = photo ? (
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <img
          src={photo.storage_path}
          alt={photo.caption ?? ''}
          className="max-h-[64vh] max-w-full object-contain sm:max-h-[72vh]"
        />

        {photo.caption && (
          <p className="mt-4 max-w-xl font-serif text-base italic text-white/80 sm:mt-5 sm:text-lg">
            {photo.caption}
          </p>
        )}
      </div>
    ) : null
  } else if (step >= videoStart && step < timelineStart) {
    const video = videos[step - videoStart]
    const videoUrl = video ? videoUrls[video.id] : undefined

    content = video ? (
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        {videoUrl ? (
          <video
            key={video.id}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="max-h-[68vh] max-w-full object-contain sm:max-h-[74vh]"
          />
        ) : (
          <div className="flex min-h-48 w-full items-center justify-center text-sm text-white/50">
            Loading video...
          </div>
        )}

        {video.caption && (
          <p className="mt-4 max-w-xl font-serif text-base italic text-white/80 sm:mt-5 sm:text-lg">
            {video.caption}
          </p>
        )}
      </div>
    ) : null
  } else if (step >= timelineStart && step < peopleStep) {
    const entry = timelineEntries[step - timelineStart]

    content = entry ? (
      <div className="w-full max-w-2xl px-2 text-center">
        {entry.entry_date && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs sm:tracking-[0.25em]">
            {entry.entry_date}
          </p>
        )}

        <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:mt-5 sm:text-5xl">
          {entry.title}
        </h2>

        {entry.note && (
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:mt-5 sm:text-lg">
            {entry.note}
          </p>
        )}
      </div>
    ) : null
  } else if (people.length > 0 && step === peopleStep) {
    content = (
      <div className="w-full max-w-2xl px-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs sm:tracking-[0.25em]">
          The people
        </p>

        <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:mt-5 sm:text-5xl">
          The ones who were there
        </h2>

        <div className="mt-7 flex max-h-[45vh] flex-wrap justify-center gap-2 overflow-y-auto sm:mt-8 sm:gap-3">
          {people.map((person) => (
            <span
              key={person.id}
              className="border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80"
            >
              {person.name}
              {person.relationship && ` · ${person.relationship}`}
            </span>
          ))}
        </div>
      </div>
    )
  } else if (songs.length > 0 && step === songsStep) {
    content = (
      <div className="w-full max-w-2xl px-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs sm:tracking-[0.25em]">
          The soundtrack
        </p>

        <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:mt-5 sm:text-5xl">
          Songs that belong to this memory
        </h2>

        <div className="mt-7 max-h-[48vh] space-y-2 overflow-y-auto text-left sm:mt-8 sm:space-y-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4"
            >
              <p className="text-sm text-white sm:text-base">
                {song.title}
              </p>

              {song.artist && (
                <p className="mt-1 text-xs text-white/50 sm:text-sm">
                  {song.artist}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    content = (
      <div className="w-full max-w-2xl px-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs sm:tracking-[0.25em]">
          Afterglow
        </p>

        <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:mt-5 sm:text-5xl md:text-6xl">
          Some moments deserve to stay.
        </h2>

        {experience.description && (
          <p className="mt-6 font-serif text-base italic leading-relaxed text-white/70 sm:mt-7 sm:text-xl">
            &ldquo;{experience.description}&rdquo;
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/80 sm:mt-10"
        >
          Return to experience
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen flex-col overflow-hidden bg-black">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:text-xs">
          Afterglow
        </span>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
        >
          Close
        </button>
      </header>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 pb-24 pt-2 sm:px-10 sm:pb-24">
        {content}
      </div>

      {/* Bottom controls */}
      <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-4 pt-10 sm:px-8 sm:pb-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
            className="shrink-0 rounded-full px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white disabled:invisible sm:px-4 sm:text-sm"
          >
            ← Back
          </button>

          {/* Progress */}
          <div className="flex min-w-0 flex-1 justify-center gap-1 overflow-hidden px-2">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const distance = Math.abs(index - step)

              return (
                <span
                  key={index}
                  className={`h-1 shrink-0 rounded-full transition-all ${
                    index === step
                      ? 'w-5 bg-white sm:w-6'
                      : distance <= 2
                        ? 'w-1.5 bg-white/30'
                        : 'w-1 bg-white/15'
                  }`}
                />
              )
            })}
          </div>

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={() =>
                setStep((current) =>
                  Math.min(current + 1, totalSteps - 1),
                )
              }
              className="shrink-0 rounded-full px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
            >
              Next →
            </button>
          ) : (
            <span className="w-[52px] shrink-0 sm:w-[64px]" />
          )}
        </div>
      </footer>
    </div>
  )
}