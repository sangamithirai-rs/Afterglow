import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useSongs } from '../../hooks/useSongs'

export function SongsSection({ experienceId }: { experienceId: string }) {
  const { songs, loading, refetch } = useSongs(experienceId)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
   if (!title.trim()) {
  setError('Enter a song title.')
  return
}

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('songs').insert({
      experience_id: experienceId,
      title: title.trim(),
      artist: artist.trim() || null,
      position: songs.length,
    })

    setSaving(false)

    if (insertError) {
      setError('Could not add song: ' + insertError.message)
      return
    }

    setTitle('')
    setArtist('')
    refetch()
  }

  async function handleDelete(songId: string) {
    setError(null)
    const { error: deleteError } = await supabase.from('songs').delete().eq('id', songId)
    if (deleteError) {
      setError('Could not remove song: ' + deleteError.message)
      return
    }
    refetch()
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-ink">Songs</h2>
      <p className="mt-1 text-sm text-ink-soft">The soundtrack of this experience.</p>

      <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
        />
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist (optional)"
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

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-ink-soft">Loading songs...</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {songs.map((song) => (
            <li key={song.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
              <span className="text-sm text-ink">
                {song.title}
                {song.artist && <span className="text-ink-soft"> — {song.artist}</span>}
              </span>
              <button type="button" onClick={() => handleDelete(song.id)} className="text-xs text-ink-soft hover:text-red-500">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}