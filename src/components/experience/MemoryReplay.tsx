import { useEffect, useState } from 'react'
import type { Experience, Photo, Song, TimelineEntry, Person } from '../../types'

interface MemoryReplayProps {
  experience: Experience
  photos: Photo[]
  songs: Song[]
  timelineEntries: TimelineEntry[]
  people: Person[]
  onClose: () => void
}

export function MemoryReplay({
  experience,
  photos,
  songs,
  timelineEntries,
  people,
  onClose,
}: MemoryReplayProps) {
  const [step, setStep] = useState(0)

  const totalSteps =
    1 +
    photos.length +
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
  const timelineStart = photoStart + photos.length
  const peopleStep = timelineStart + timelineEntries.length
  const songsStep = peopleStep + (people.length > 0 ? 1 : 0)
  
  let content

  if (step === 0) {
    content = (
      <div className="text-center">
        {experience.cover_image_url && (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="mx-auto mb-8 max-h-[45vh] w-full max-w-3xl rounded-2xl object-cover"
          />
        )}

        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          {experience.event_date}
          {experience.event_date && experience.location && ' · '}
          {experience.location}
        </p>

        <h1 className="mt-4 font-serif text-4xl text-white sm:text-6xl">
          {experience.title}
        </h1>

        <p className="mt-5 text-sm text-white/60">
          A memory worth keeping.
        </p>
      </div>
    )
  } else if (step >= photoStart && step < timelineStart) {
    const photo = photos[step - photoStart]

    content = photo ? (
      <div className="text-center">
        <img
          src={photo.storage_path}
          alt={photo.caption ?? ''}
          className="mx-auto max-h-[72vh] max-w-full rounded-2xl object-contain"
        />

        {photo.caption && (
          <p className="mt-5 font-serif text-lg italic text-white/80">
            {photo.caption}
          </p>
        )}
      </div>
    ) : null
  } else if (step >= timelineStart && step < peopleStep) {
    const entry = timelineEntries[step - timelineStart]

    content = entry ? (
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          {entry.entry_date}
        </p>

        <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
          {entry.title}
        </h2>

        {entry.note && (
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            {entry.note}
          </p>
        )}
      </div>
    ) : null
  } else if (people.length > 0 && step === peopleStep) {
    content = (
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          The people
        </p>

        <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
          The ones who were there
        </h2>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {people.map((person) => (
            <span
              key={person.id}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/80"
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
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          The soundtrack
        </p>

        <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
          Songs that belong to this memory
        </h2>

        <div className="mt-8 space-y-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left"
            >
              <p className="text-white">{song.title}</p>
              {song.artist && (
                <p className="mt-1 text-sm text-white/50">{song.artist}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    content = (
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          Afterglow
        </p>

        <h2 className="mt-5 font-serif text-4xl text-white sm:text-6xl">
          Some moments deserve to stay.
        </h2>

        {experience.description && (
          <p className="mt-7 font-serif text-lg italic leading-relaxed text-white/70 sm:text-xl">
            &ldquo;{experience.description}&rdquo;
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-10 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/80"
        >
          Return to experience
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen flex-col bg-black">
      <div className="flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          Afterglow
        </span>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-5 pb-20 sm:px-10">
        {content}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0}
          className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:invisible"
        >
          ← Back
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === step ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() =>
              setStep((current) => Math.min(current + 1, totalSteps - 1))
            }
            className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Next →
          </button>
        ) : (
          <span className="w-16" />
        )}
      </div>
    </div>
  )
}