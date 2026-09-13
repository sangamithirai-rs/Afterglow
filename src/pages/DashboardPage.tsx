import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
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
        <button
          type="button"
          onClick={signOut}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}