import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 sm:px-6 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-serif text-base text-ink">Afterglow</span>
          <span className="mx-2">·</span>
          <span>Create a memory worth keeping.</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>
            Created by{' '}
            <span className="font-medium text-ink">
              Sangamithirai RS
            </span>
          </span>

          <span aria-hidden="true">·</span>

          <a
            href="https://github.com/sangamithirai-rs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink transition hover:text-accent"
          >
            GitHub
          </a>

          <span aria-hidden="true">·</span>

          <a
            href="https://www.linkedin.com/in/sangamithirai-rs/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink transition hover:text-accent"
          >
            LinkedIn
          </a>

          <span aria-hidden="true">·</span>

          <Link
            to="/privacy"
            className="font-medium text-ink transition hover:text-accent"
          >
            Privacy
          </Link>

          <span aria-hidden="true">·</span>

          <Link
            to="/terms"
            className="font-medium text-ink transition hover:text-accent"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}