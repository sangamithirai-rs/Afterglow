import { Link } from 'react-router-dom'
import type { Experience } from '../../types'

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experiences/${experience.id}/edit`}
      className="block overflow-hidden rounded-lg border border-border bg-surface transition hover:border-accent-soft"
    >
      <div className="flex h-36 items-center justify-center bg-bg-subtle">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-ink-soft">No cover image</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-ink">
            {experience.title}
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              experience.status === 'published'
                ? 'bg-accent/15 text-accent'
                : 'bg-ink-soft/10 text-ink-soft'
            }`}
          >
            {experience.status}
          </span>
        </div>
        {experience.location && (
          <p className="mt-1 text-sm text-ink-soft">{experience.location}</p>
        )}
      </div>
    </Link>
  )
}