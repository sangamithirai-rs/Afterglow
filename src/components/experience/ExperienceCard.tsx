import { Link } from 'react-router-dom'
import type { Experience } from '../../types'

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experiences/${experience.id}/edit`}
      className="group block overflow-hidden border border-border bg-surface transition hover:border-accent-soft"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-subtle">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-sm italic text-ink-soft">
              No cover image
            </span>
          </div>
        )}

        {/* Status */}
        <span className="absolute left-4 top-4 bg-bg/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
          {experience.status}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-xl font-medium leading-tight text-ink">
          {experience.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          {experience.location && (
            <span>{experience.location}</span>
          )}

          {experience.location && experience.event_date && (
            <span aria-hidden="true">·</span>
          )}

          {experience.event_date && (
            <span>
              {new Date(experience.event_date).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition group-hover:text-accent">
            Open experience →
          </span>
        </div>
      </div>
    </Link>
  )
}