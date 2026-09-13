import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useTimelineEntries } from '../../hooks/useTimelineEntries'

export function TimelineSection({ experienceId }: { experienceId: string }) {
  const { entries, loading, refetch } = useTimelineEntries(experienceId)
  const [title, setTitle] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    await supabase.from('timeline_entries').insert({
      experience_id: experienceId,
      title: title.trim(),
      entry_date: entryDate || null,
      note: note.trim() || null,
      position: entries.length,
    })
    setSaving(false)
    setTitle('')
    setEntryDate('')
    setNote('')
    refetch()
  }

  async function handleDelete(entryId: string) {
    await supabase.from('timeline_entries').delete().eq('id', entryId)
    refetch()
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-ink">Timeline</h2>
      <p className="mt-1 text-sm text-ink-soft">How the day or trip unfolded.</p>

      <form onSubmit={handleAdd} className="mt-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
          />
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
          />
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          Add entry
        </button>
      </form>

      {loading ? (
        <p className="mt-4 text-sm text-ink-soft">Loading timeline...</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border bg-surface px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{entry.title}</p>
                  {entry.entry_date && <p className="text-xs text-ink-soft">{entry.entry_date}</p>}
                  {entry.note && <p className="mt-1 text-sm text-ink-soft">{entry.note}</p>}
                </div>
                <button type="button" onClick={() => handleDelete(entry.id)} className="text-xs text-ink-soft hover:text-red-500">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}