import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function FinalCTA() {
  const { user, signInWithGoogle } = useAuth()

  return (
    <section className="border-t border-border px-6 py-20 text-center md:py-28">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Keep what matters
        </p>

        <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-ink md:text-5xl">
          Some moments deserve more than a camera roll.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-ink-soft md:text-base">
          Give them a place to live, remember, and return to.
        </p>

        <div className="mt-8">
          {user ? (
            <Link
              to="/dashboard"
             className="inline-flex w-full justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-soft sm:w-auto"
            >
              My Afterglows
            </Link>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-soft sm:w-auto"
            >
              Start your Afterglow
            </button>
          )}
        </div>
      </div>
    </section>
  )
}