import { useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useVideos } from '../../hooks/useVideos'
import { useAuth } from '../../contexts/AuthContext'
import { LoadError } from './LoadError'

const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024
const SIGNED_URL_EXPIRY = 60 * 60

export function VideosSection({
  experienceId,
}: {
  experienceId: string
}) {
  const { user } = useAuth()
  const { videos, loading, error: loadError, refetch } =
    useVideos(experienceId)

  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})
  const [urlsReady, setUrlsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSignedUrls() {
      if (videos.length === 0) {
        setVideoUrls({})
        return
      }

      const urls: Record<string, string> = {}

      setUrlsReady(false)

      // Request every signed URL at once instead of one after another.
      await Promise.all(
        videos.map(async (video) => {
          const { data, error: signedUrlError } = await supabase.storage
            .from('experience-videos')
            .createSignedUrl(video.storage_path, SIGNED_URL_EXPIRY)

          if (!signedUrlError && data?.signedUrl) {
            urls[video.id] = data.signedUrl
          }
        }),
      )

      if (cancelled) return

      setVideoUrls(urls)
      setUrlsReady(true)
    }

    loadSignedUrls()

    return () => {
      cancelled = true
    }
  }, [videos])

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])

    if (files.length === 0 || !user) return

    setError(null)
    setUploading(true)

    let uploadedCount = 0
    let firstError: string | null = null

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        firstError ??= `"${file.name}" is not a supported video format.`
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        firstError ??= `"${file.name}" is larger than 50MB.`
        continue
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()

      if (!fileExt) {
        firstError ??= `Could not determine the file type for "${file.name}".`
        continue
      }

      const filePath = `${user.id}/${experienceId}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('experience-videos')
        .upload(filePath, file, {
          contentType: file.type,
        })

      if (uploadError) {
        firstError ??= `Could not upload "${file.name}".`
        continue
      }

      const { error: insertError } = await supabase.from('videos').insert({
        experience_id: experienceId,
        storage_path: filePath,
        position: videos.length + uploadedCount,
      })

      if (insertError) {
        await supabase.storage
          .from('experience-videos')
          .remove([filePath])

        firstError ??= `Could not save "${file.name}".`
        continue
      }

      uploadedCount++
    }

    setUploading(false)
    e.target.value = ''

    if (firstError) {
      setError(firstError)
    }

    if (uploadedCount > 0) {
      await refetch()
    }
  }

  async function handleDelete(videoId: string, storagePath: string) {
    setError(null)
    setDeletingId(videoId)

    const { error: storageError } = await supabase.storage
      .from('experience-videos')
      .remove([storagePath])

    if (storageError) {
      setError('Could not remove the video file.')
      setDeletingId(null)
      return
    }

    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (deleteError) {
      setError(
        'The video file was removed, but its record could not be deleted.',
      )
      setDeletingId(null)
      return
    }

    setDeletingId(null)
    await refetch()
  }

  return (
    <div>
      {/* Upload */}
      <div>
        <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft hover:bg-surface focus-within:ring-2 focus-within:ring-accent">
          {uploading ? 'Uploading...' : '+ Add videos'}

          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>

        <p className="mt-2 text-xs text-ink-soft">
          MP4, WebM or MOV · Max 50MB each
        </p>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-red-500 px-3 py-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {loadError && !loading ? (
        <LoadError what="videos" onRetry={refetch} />
      ) : null}

      {videos.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-ink-soft">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </p>

          <div className="space-y-5">
            {videos.map((video) => {
              const videoUrl = videoUrls[video.id]

              return (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-black"
                >
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="block max-h-[70vh] w-full object-contain"
                    />
                  ) : (
                    <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-white/70">
                      {urlsReady
                        ? 'Unable to load this video.'
                        : 'Loading video...'}
                    </div>
                  )}

                  {/* Always visible on touch screens, hover-only on larger ones */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(video.id, video.storage_path)
                    }
                    disabled={deletingId === video.id}
                    className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    {deletingId === video.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : loading ? (
        <p className="mt-6 text-sm text-ink-soft">Loading videos...</p>
      ) : !loadError ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <p className="font-serif text-lg text-ink">No videos yet.</p>

          <p className="mt-1 text-sm text-ink-soft">
            Add a few moving moments to bring this experience to life.
          </p>
        </div>
      ) : null}
    </div>
  )
}
