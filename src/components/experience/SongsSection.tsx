import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useSongs } from '../../hooks/useSongs'
import { LoadError } from './LoadError'

export function SongsSection({ experienceId }: { experienceId: string }) {
  const { songs, loading, error: loadError, refetch } = useSongs(experienceId)

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
      {/* Add song */}
      <form onSubmit={handleAdd}>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            aria-label="Song title"
            className="border-b border-border bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
          />

          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist (optional)"
            aria-label="Artist"
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

      {loadError && !loading ? (
        <LoadError what="songs" onRetry={refetch} />
      ) : null}

      {/* Songs */}
      {songs.length > 0 ? (
        <div className="mt-6">
          <p className="mb-1 text-sm text-ink-soft">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>

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
                aria-label={`Remove ${song.title}`}
                className="shrink-0 text-sm text-ink-soft transition hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : loading ? (
        <p className="mt-6 text-sm text-ink-soft">Loading songs...</p>
      ) : !loadError ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">No songs yet.</p>

          <p className="mt-1 text-sm text-ink-soft">
            Add the songs that belong to this memory.
          </p>
        </div>
      ) : null}
    </div>
  )
}
