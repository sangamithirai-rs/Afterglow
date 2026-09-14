import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <p className="font-serif text-3xl text-ink">Page not found</p>
      <p className="text-ink-soft">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 text-accent underline">
        Back to Afterglow
      </Link>
    </div>
  )
}