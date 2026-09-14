const steps = [
  {
    number: '01',
    title: 'Start an experience',
    description:
      'Give it a title, a date, a place — the moment you want to hold onto.',
  },
  {
    number: '02',
    title: 'Build the story',
    description:
      'Add photos, songs, people, and a timeline to capture how the experience unfolded.',
  },
  {
    number: '03',
    title: 'Keep it yours',
    description:
      'Keep it private, share it with anyone who has the link, or invite specific people.',
  },
]

export function HowItWorks() {
  return (
    <section
      className="bg-bg-subtle px-6 py-20 md:py-28"
      id="how-it-works"
    >
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            The process
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium text-ink md:text-4xl">
            How Afterglow works
          </h2>
        </div>

        <div className="mt-14 grid gap-0 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`border-t border-border px-0 py-7 md:px-7 md:py-6 ${
                index === 0 ? 'md:pl-0' : ''
              } ${
                index === steps.length - 1 ? 'md:pr-0' : ''
              }`}
            >
              <span className="font-serif text-3xl text-accent">
                {step.number}
              </span>

              <h3 className="mt-4 font-serif text-xl font-medium text-ink">
                {step.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}