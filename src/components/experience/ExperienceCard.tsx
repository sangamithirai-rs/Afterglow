import { Link } from 'react-router-dom'
import type { Experience } from '../../types'

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experiences/${experience.id}/edit`}
      className="group block border-t border-border pt-4 transition"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-subtle">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.015]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-sm italic text-ink-soft">
              No cover image
            </span>
          </div>
        )}

        {/* Status */}
        <span className="absolute left-3 top-3 bg-bg/85 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-ink-soft backdrop-blur-sm">
          {experience.status}
        </span>
      </div>

      {/* Details */}
      <div className="pt-5">
        <h3 className="font-serif text-2xl font-medium leading-tight text-ink transition group-hover:text-accent">
          {experience.title}
        </h3>

        {(experience.location || experience.event_date) && (
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
        )}

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft transition group-hover:text-accent">
            Open experience
          </span>

          <span
            aria-hidden="true"
            className="text-sm text-ink-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}