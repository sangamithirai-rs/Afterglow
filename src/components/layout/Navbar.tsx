import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="w-full px-5 py-5 sm:px-6 md:px-12 md:py-6">
      <div className="flex items-center justify-between">
      {/* Logo */}
<Link
  to="/"
  className="flex shrink-0 items-center gap-2.5"
>
  {/* Light theme */}
  <img
    src="/afterglow-icon-light.png"
    alt=""
    className="h-8 w-8 rounded-lg dark:hidden"
  />

  {/* Dark theme */}
  <img
    src="/afterglow-icon.png"
    alt=""
    className="hidden h-8 w-8 rounded-lg dark:block"
  />

  <span className="font-serif text-2xl font-medium text-ink">
    Afterglow
  </span>
</Link>
        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <ThemeToggle />

          {user && (
            <>
              

              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft"
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          {user && (
            <>
             

              <button
                type="button"
                onClick={signOut}
                className="whitespace-nowrap rounded-full border border-border px-3 py-2 text-xs font-medium text-ink transition hover:border-accent-soft"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}