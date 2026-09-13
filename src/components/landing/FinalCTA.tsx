import { useAuth } from '../../contexts/AuthContext'

export function FinalCTA() {
  const { signInWithGoogle } = useAuth()

  return (
    <section className="px-6 py-24 text-center md:py-32">
      <h2 className="mx-auto max-w-lg font-serif text-3xl font-medium text-ink md:text-4xl">
        Some moments deserve more than a camera roll.
      </h2>
      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-8 rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-soft"
      >
        Sign in with Google
      </button>
    </section>
  )
}