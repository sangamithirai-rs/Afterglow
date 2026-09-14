import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { usePeople } from '../../hooks/usePeople'

export function PeopleSection({ experienceId }: { experienceId: string }) {
  const { people, loading, refetch } = usePeople(experienceId)

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setError('Enter a name.')
      return
    }

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('people').insert({
      experience_id: experienceId,
      name: name.trim(),
      relationship: relationship.trim() || null,
    })

    setSaving(false)

    if (insertError) {
      setError('Could not add person: ' + insertError.message)
      return
    }

    setName('')
    setRelationship('')
    refetch()
  }

  async function handleDelete(personId: string) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('people')
      .delete()
      .eq('id', personId)

    if (deleteError) {
      setError('Could not remove person: ' + deleteError.message)
      return
    }

    refetch()
  }

  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink">
            People
          </h2>

          <p className="mt-1 text-sm text-ink-soft">
            Who was there.
          </p>
        </div>

        {people.length > 0 && (
          <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
            {people.length}{' '}
            {people.length === 1 ? 'person' : 'people'}
          </span>
        )}
      </div>

      {/* Add person */}
      <form
        onSubmit={handleAdd}
        className="mt-6 border-t border-border pt-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <input
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Relationship (optional)"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
          >
            {saving ? 'Adding...' : '+ Add person'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-4 border-l-2 border-red-500 px-3 py-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* People */}
      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">
          Loading people...
        </p>
      ) : people.length === 0 ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">
            No one added yet.
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Add the people who were part of this experience.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {people.map((person, index) => (
            <div
              key={person.id}
              className={`flex items-center justify-between gap-6 py-4 ${
                index !== 0 ? 'border-t border-border' : ''
              }`}
            >
              <div>
                <p className="font-serif text-lg font-medium text-ink">
                  {person.name}
                </p>

                {person.relationship && (
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {person.relationship}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(person.id)}
                className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft transition hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}