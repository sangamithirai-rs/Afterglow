const features = [
  { title: 'Photos', description: 'Build a gallery for every experience, ordered the way you remember it.' },
  { title: 'Songs', description: 'Attach the soundtrack — the songs that will always mean this moment.' },
  { title: 'Timeline', description: 'Lay out how the day or trip unfolded, entry by entry.' },
  { title: 'People', description: 'Note who was there, so the memory stays whole.' },
]

export function Features() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-3xl font-medium text-ink md:text-4xl">
          Everything a memory needs
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-surface p-6">
              <h3 className="font-serif text-lg font-medium text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}