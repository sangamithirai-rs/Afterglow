import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { ExperienceCard } from '../components/experience/ExperienceCard'
import { useAuth } from '../contexts/AuthContext'
import { useExperiences } from '../hooks/useExperiences'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { experiences, loading, error } = useExperiences()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-medium text-ink">My Afterglows</h1>
          <Link
            to="/experiences/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft"
          >
            New experience
          </Link>
        </div>
        <p className="mt-2 text-ink-soft">Signed in as {user?.email}</p>

        <div className="mt-10">
          {loading && (
            <p className="text-ink-soft">Loading your experiences...</p>
          )}

          {error && (
            <p className="text-sm text-red-500">Couldn't load experiences: {error}</p>
          )}

          {!loading && !error && experiences.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-ink-soft">
                No experiences yet — create your first one.
              </p>
            </div>
          )}

          {!loading && !error && experiences.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-10 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}