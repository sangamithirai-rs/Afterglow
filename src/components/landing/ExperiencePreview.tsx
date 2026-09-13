export function ExperiencePreview() {
  return (
    <section className="bg-bg-subtle px-6 py-20 md:py-28" id="explore">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-border bg-surface/70 backdrop-blur">
        <div className="flex h-64 items-center justify-center bg-[linear-gradient(135deg,var(--accent-soft)_0%,transparent_70%)] opacity-40">
          <span className="font-serif text-sm text-ink-soft">
            (cover image placeholder)
          </span>
        </div>
        <div className="p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            Public experience
          </p>
          <h3 className="mt-2 font-serif text-2xl font-medium text-ink">
            A week in Lisbon
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            June 2025 · Portugal
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Six days, one very small apartment, and the best pastel de nata
            of my life. This is what it looked like.
          </p>
        </div>
      </div>
    </section>
  )
}