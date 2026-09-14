import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useTimelineEntries } from '../../hooks/useTimelineEntries'

export function TimelineSection({ experienceId }: { experienceId: string }) {
  const { entries, loading, refetch } = useTimelineEntries(experienceId)

  const [title, setTitle] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Enter what happened.')
      return
    }

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('timeline_entries')
      .insert({
        experience_id: experienceId,
        title: title.trim(),
        entry_date: entryDate || null,
        note: note.trim() || null,
        position: entries.length,
      })

    setSaving(false)

    if (insertError) {
      setError('Could not add entry: ' + insertError.message)
      return
    }

    setTitle('')
    setEntryDate('')
    setNote('')
    refetch()
  }

  async function handleDelete(entryId: string) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('timeline_entries')
      .delete()
      .eq('id', entryId)

    if (deleteError) {
      setError('Could not remove entry: ' + deleteError.message)
      return
    }

    refetch()
  }

  return (
    <div>
      {/* Moment count */}
{entries.length > 0 && (
  <div className="flex justify-end">
    <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
      {entries.length}{' '}
      {entries.length === 1 ? 'moment' : 'moments'}
    </span>
  </div>
)}

      {/* Add entry */}
      <form
        onSubmit={handleAdd}
        className="mt-6 border-t border-border pt-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="mt-3 w-full resize-none border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          {saving ? 'Adding...' : '+ Add moment'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-4 border-l-2 border-red-500 px-3 py-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Timeline */}
      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">
          Loading timeline...
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">
            No moments yet.
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Add the moments that shaped this experience.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`grid gap-3 py-5 sm:grid-cols-[140px_1fr_auto] sm:gap-6 ${
                index !== 0 ? 'border-t border-border' : ''
              }`}
            >
              <div>
                {entry.entry_date && (
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                    {entry.entry_date}
                  </p>
                )}
              </div>

              <div>
                <p className="font-serif text-lg font-medium text-ink">
                  {entry.title}
                </p>

                {entry.note && (
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {entry.note}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="w-fit text-xs font-medium uppercase tracking-[0.12em] text-ink-soft transition hover:text-red-500"
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