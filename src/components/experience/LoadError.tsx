/** Shown by an editor section when its list fails to load. */
export function LoadError({
  what,
  onRetry,
}: {
  what: string
  onRetry: () => void
}) {
  return (
    <div role="alert" className="mt-6 border-l-2 border-red-500 px-4 py-2">
      <p className="text-sm text-red-500">
        Could not load {what}. Check your connection and try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-xs font-medium text-ink underline underline-offset-2 transition hover:text-accent"
      >
        Try again
      </button>
    </div>
  )
}
