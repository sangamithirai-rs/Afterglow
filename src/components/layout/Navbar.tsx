import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 md:px-12">
      <span className="font-serif text-2xl font-medium text-ink">
        Afterglow
      </span>
      <div className="flex items-center gap-5">
        <a href="#explore" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">
          Explore
        </a>
        <ThemeToggle />
        <button
          type="button"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft"
        >
          Sign in with Google
        </button>
      </div>
    </nav>
  )
}