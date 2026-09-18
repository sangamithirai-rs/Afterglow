const features = [
  {
    number: '01',
    title: 'Photos',
    description:
      'Build a gallery for every experience, ordered the way you remember it.',
  },
  {
    number: '02',
    title: 'Videos',
    description:
      'Keep the moving moments that bring the memory back to life.',
  },
  {
    number: '03',
    title: 'Songs',
    description:
      'Attach the soundtrack — the songs that will always mean this moment.',
  },
  {
    number: '04',
    title: 'Timeline',
    description:
      'Lay out how the day or trip unfolded, entry by entry.',
  },
  {
    number: '05',
    title: 'People',
    description:
      'Note who was there, so the memory stays whole.',
  },
]

export function Features() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Inside every experience
            </p>

            <h2 className="mt-3 font-serif text-3xl font-medium text-ink md:text-4xl">
              Everything a memory needs
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Keep the details that make a moment feel like yours.
          </p>
        </div>

        <div className="grid md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`py-8 md:px-8 ${
                index % 2 === 0
                  ? 'md:border-r md:border-border md:pl-0'
                  : 'md:pr-0'
              } ${
                index >= 2
                  ? 'border-t border-border'
                  : ''
              } ${
                index === features.length - 1
                  ? 'md:col-span-2 md:border-r-0 md:pl-0'
                  : ''
              }`}
            >
              <div className="flex gap-6">
                <span className="font-serif text-2xl text-accent">
                  {feature.number}
                </span>

                <div>
                  <h3 className="font-serif text-xl font-medium text-ink">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}