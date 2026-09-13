import { useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'
import { useAuth } from '../../contexts/AuthContext'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function PhotoGallerySection({ experienceId }: { experienceId: string }) {
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

    const { data } = supabase.storage.from('experience-images').getPublicUrl(filePath)

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
    await supabase.from('photos').delete().eq('id', photoId)
    refetch()
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-ink">Photos</h2>
      <p className="mt-1 text-sm text-ink-soft">Build a gallery for this experience.</p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="mt-3 text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-soft disabled:opacity-50"
      />

      {loading ? (
        <p className="mt-4 text-sm text-ink-soft">Loading photos...</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={photo.storage_path} alt={photo.caption ?? ''} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
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