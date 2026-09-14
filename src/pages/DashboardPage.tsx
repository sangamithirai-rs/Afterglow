import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { ExperienceCard } from '../components/experience/ExperienceCard'
import { useAuth } from '../contexts/AuthContext'
import { useExperiences } from '../hooks/useExperiences'

export function DashboardPage() {
  const { user } = useAuth()
  const { experiences, loading, error } = useExperiences()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14 md:py-16">
        {/* Header */}
        <header className="border-b border-border pb-8 sm:pb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
                Your collection
              </p>

              <h1 className="mt-3 font-serif text-4xl font-medium text-ink sm:text-5xl">
                My Afterglows
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                The moments you've chosen to keep.
              </p>
            </div>

            <Link
              to="/experiences/new"
              className="w-full rounded-full bg-accent px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-accent-soft sm:w-fit"
            >
              + New experience
            </Link>
          </div>

          {user?.email && (
            <p className="mt-6 text-xs text-ink-soft">
              Signed in as {user.email}
            </p>
          )}
        </header>

        {/* Experiences */}
        <section className="pt-10 sm:pt-12">
          {loading && (
            <div className="border-t border-border py-8">
              <p className="text-sm text-ink-soft">
                Loading your experiences...
              </p>
            </div>
          )}

          {error && (
            <div className="border-l-2 border-red-500 px-4 py-2">
              <p className="text-sm text-red-500">
                Couldn't load experiences: {error}
              </p>
            </div>
          )}

          {!loading && !error && experiences.length === 0 && (
            <div className="border-t border-border py-16 text-center sm:py-20">
              <p className="font-serif text-2xl text-ink">
                Nothing here yet.
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                Start with a moment you don't want to forget.
              </p>

              <Link
                to="/experiences/new"
                className="mt-7 inline-flex rounded-full border border-border px-6 py-3 text-sm font-medium text-ink transition hover:border-accent-soft hover:bg-surface"
              >
                Create your first Afterglow
              </Link>
            </div>
          )}

          {!loading && !error && experiences.length > 0 && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
                  {experiences.length}{' '}
                  {experiences.length === 1 ? 'experience' : 'experiences'}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {experiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}