import { useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'
import { useAuth } from '../../contexts/AuthContext'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function PhotoGallerySection({
  experienceId,
}: {
  experienceId: string
}) {
  const { user } = useAuth()
  const { photos, loading, refetch } = usePhotos(experienceId)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB.')
      return
    }

    setError(null)
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${experienceId}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('experience-images')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage
      .from('experience-images')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase.from('photos').insert({
      experience_id: experienceId,
      storage_path: data.publicUrl,
      position: photos.length,
    })

    setUploading(false)
    e.target.value = ''

    if (insertError) {
      setError(insertError.message)
      return
    }

    refetch()
  }

  async function handleDelete(photoId: string) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      setError('Could not remove photo: ' + deleteError.message)
      return
    }

    refetch()
  }

  return (
    <div>
     {/* Photo count */}
{photos.length > 0 && (
  <div className="flex justify-end">
    <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
      {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
    </span>
  </div>
)}

      {/* Upload */}
      <div className="mt-6 border-t border-border pt-5">
        <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft hover:bg-surface">
          {uploading ? 'Uploading...' : '+ Add photo'}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>

        <p className="mt-2 text-xs text-ink-soft">
          JPEG, PNG or WebP · Max 5MB
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 border-l-2 border-red-500 px-3 py-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Gallery */}
      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">
          Loading photos...
        </p>
      ) : photos.length === 0 ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">
            No photos yet.
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Add a few moments to bring this experience to life.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden border border-border bg-bg-subtle"
            >
              <img
                src={photo.storage_path}
                alt={photo.caption ?? ''}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute right-2 top-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/80"
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