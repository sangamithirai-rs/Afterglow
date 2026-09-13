import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { usePeople } from '../../hooks/usePeople'

export function PeopleSection({ experienceId }: { experienceId: string }) {
  const { people, loading, refetch } = usePeople(experienceId)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    await supabase.from('people').insert({
      experience_id: experienceId,
      name: name.trim(),
      relationship: relationship.trim() || null,
    })
    setSaving(false)
    setName('')
    setRelationship('')
    refetch()
  }

  async function handleDelete(personId: string) {
    await supabase.from('people').delete().eq('id', personId)
    refetch()
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-ink">People</h2>
      <p className="mt-1 text-sm text-ink-soft">Who was there.</p>

      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
        />
        <input
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relationship (optional)"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="mt-4 text-sm text-ink-soft">Loading people...</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink">
              {person.name}
              {person.relationship && <span className="text-ink-soft">· {person.relationship}</span>}
              <button type="button" onClick={() => handleDelete(person.id)} className="text-ink-soft hover:text-red-500">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}