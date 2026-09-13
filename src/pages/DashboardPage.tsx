import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg px-6 py-12 text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-medium">My Afterglows</h1>
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