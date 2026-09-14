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

    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)

    if (deleteError) {
      setError('Could not remove song: ' + deleteError.message)
      return
    }

    refetch()
  }

  return (
    <div>
      {/* Song count */}
{songs.length > 0 && (
  <div className="flex justify-end">
    <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
      {songs.length} {songs.length === 1 ? 'song' : 'songs'}
    </span>
  </div>
)}
      {/* Add song */}
      <form
        onSubmit={handleAdd}
        className="mt-6 border-t border-border pt-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist (optional)"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
          >
            {saving ? 'Adding...' : '+ Add song'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-4 border-l-2 border-red-500 px-3 py-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Songs */}
      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">
          Loading songs...
        </p>
      ) : songs.length === 0 ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">
            No songs yet.
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Add the songs that belong to this memory.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`flex items-center justify-between gap-6 py-4 ${
                index !== 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="font-serif text-lg text-ink">
                  {song.title}
                </p>

                {song.artist && (
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {song.artist}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(song.id)}
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