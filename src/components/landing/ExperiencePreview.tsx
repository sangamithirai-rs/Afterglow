export function ExperiencePreview() {
  return (
    <section className="bg-bg-subtle px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              A glimpse inside
            </p>

            <h2 className="mt-3 font-serif text-3xl font-medium text-ink md:text-4xl">
              A memory, kept intact.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Not a feed. Not a post. Just a place for a moment worth keeping.
          </p>
        </div>

        <article className="overflow-hidden border border-border bg-surface">
          {/* Cover */}
          <div className="relative h-64 bg-[linear-gradient(135deg,var(--accent-soft)_0%,transparent_70%)] sm:h-80 md:h-[26rem]">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-serif text-sm italic text-ink-soft/70">
                A week in Lisbon
              </p>
            </div>

            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
                June 2025 · Portugal
              </p>
            </div>
          </div>

          {/* Story */}
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.4fr] md:p-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
                The experience
              </p>

              <h3 className="mt-3 font-serif text-3xl font-medium text-ink">
                A week in Lisbon
              </h3>
            </div>

            <div>
              <p className="text-base leading-8 text-ink-soft">
                Six days, one very small apartment, and the best pastel de nata
                of my life. Wandering through streets we'd never seen before,
                staying out later than planned, and collecting the little
                moments that made the week feel like ours.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-xs uppercase tracking-[0.14em] text-ink-soft">
                <span>12 photos</span>
                <span>4 moments</span>
                <span>3 people</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}