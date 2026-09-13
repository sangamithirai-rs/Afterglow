const steps = [
  {
    number: '01',
    title: 'Start an experience',
    description: 'Give it a title, a date, a place — the moment you want to hold onto.',
  },
  {
    number: '02',
    title: 'Fill it with memory',
    description: 'Add photos, the songs that played, the people who were there, a timeline of how it unfolded.',
  },
  {
    number: '03',
    title: 'Keep it or share it',
    description: 'Leave it private just for you, or publish it to a page anyone can visit.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-bg-subtle px-6 py-20 md:py-28" id="how-it-works">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-serif text-3xl font-medium text-ink md:text-4xl">
          How Afterglow works
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="border-t border-border pt-6">
              <span className="font-serif text-3xl text-accent">{step.number}</span>
              <h3 className="mt-3 font-serif text-xl font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}