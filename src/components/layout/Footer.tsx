export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 sm:px-6 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-serif text-base text-ink">Afterglow</span>
          <span className="mx-2">·</span>
          <span>Create a memory worth keeping.</span>
        </div>

        <div>
          Created by{' '}
          <span className="font-medium text-ink">Sangamithirai RS</span>

          <span className="mx-2">·</span>

          <a
            href="https://github.com/sangamithirai-rs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink transition hover:text-accent"
          >
            GitHub
          </a>

          <span className="mx-2">·</span>

          <a
            href="https://www.linkedin.com/in/sangamithirai-rs/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink transition hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}