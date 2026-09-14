import { useAuth } from '../../contexts/AuthContext'

export function Hero() {
  const { user, signInWithGoogle } = useAuth()

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 text-center md:pb-32 md:pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_top,var(--accent-soft)_0%,transparent_60%)] opacity-20" />
      <h1 className="mx-auto max-w-3xl font-serif text-5xl font-medium leading-tight text-ink md:text-7xl">
        Afterglow
      </h1>
      <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic text-ink-soft md:text-2xl">
        Create a memory worth keeping.
      </p>
      <p className="mx-auto mt-6 max-w-lg text-base text-ink-soft md:text-lg">
        Trips, birthdays, concerts, the small perfect days — turn them into
        experiences you can revisit, and share the ones you want the world to see.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {!user && (
  <button
    type="button"
    onClick={signInWithGoogle}
    className="rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-soft"
  >
    Sign in with Google
  </button>
)}
        <a href="#explore" className="rounded-full border border-border px-8 py-3.5 text-sm font-medium text-ink transition hover:border-accent-soft">
          Explore public experiences
        </a>
      </div>
    </section>
  )
}