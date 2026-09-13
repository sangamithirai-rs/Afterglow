import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-5 md:px-12">
      <Link to="/" className="font-serif text-2xl font-medium text-ink">
        Afterglow
      </Link>
      <div className="flex items-center gap-5">
        <a href="#explore" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">
          Explore
        </a>
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block"
            >
              My Afterglows
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  )
}