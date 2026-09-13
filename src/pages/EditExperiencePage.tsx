import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useExperience } from '../hooks/useExperience'
import { supabase } from '../lib/supabase'
import { PhotoGallerySection } from '../components/experience/PhotoGallerySection'
import { SongsSection } from '../components/experience/SongsSection'
import { TimelineSection } from '../components/experience/TimelineSection'
import { PeopleSection } from '../components/experience/PeopleSection'
import { InviteSection } from '../components/experience/InviteSection'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

function generateSlug() {
  return crypto.randomUUID().split('-')[0]
}

export function EditExperiencePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { experience, loading: loadingExperience, error: loadError } = useExperience(id)

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<'private' | 'invite_only'>('private')

    // Populate form fields once the experience loads
  useEffect(() => {
    if (!experience) return
    setTitle(experience.title)
    setLocation(experience.location ?? '')
    setEventDate(experience.event_date ?? '')
    setDescription(experience.description ?? '')
    setCoverImageUrl(experience.cover_image_url)
    setVisibility(experience.visibility as 'private' | 'invite_only')
  }, [experience])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB.')
      return
    }

    setError(null)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function uploadNewCoverIfNeeded(): Promise<string | null> {
    if (!coverFile || !user) return coverImageUrl

    const fileExt = coverFile.name.split('.').pop()
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('experience-images')
      .upload(filePath, coverFile)

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from('experience-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Give your experience a title.')
      return
    }
    if (!id) return

    setSaving(true)
    try {
      const finalCoverUrl = await uploadNewCoverIfNeeded()

            const { error: updateError } = await supabase
        .from('experiences')
        .update({
          title: title.trim(),
          location: location.trim() || null,
          event_date: eventDate || null,
          description: description.trim() || null,
          cover_image_url: finalCoverUrl,
          visibility,
        })
        .eq('id', id)

      if (updateError) throw new Error(updateError.message)

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish() {
  if (!experience || !id) return
  setError(null)
  setSaving(true)

  const willPublish = experience.status !== 'published'
  const slug = experience.share_slug ?? generateSlug()

  const { error: publishError } = await supabase
    .from('experiences')
    .update({
      status: willPublish ? 'published' : 'draft',
      share_slug: slug,
    })
    .eq('id', id)

  setSaving(false)

  if (publishError) {
    setError(publishError.message)
    return
  }

  navigate('/dashboard')
}
async function handleVisibilityChange(newVisibility: 'private' | 'invite_only') {
  if (!id) return
  setVisibility(newVisibility)

  const { error: visibilityError } = await supabase
    .from('experiences')
    .update({ visibility: newVisibility })
    .eq('id', id)

  if (visibilityError) {
    setError(visibilityError.message)
  }
}

  async function handleDelete() {
    if (!id) return
    const confirmed = window.confirm(
      'Delete this experience permanently? This will also delete all its photos, songs, timeline entries, and people. This cannot be undone.'
    )
    if (!confirmed) return

    setSaving(true)
    const { error: deleteError } = await supabase.from('experiences').delete().eq('id', id)
    setSaving(false)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    navigate('/dashboard')
  }

  if (loadingExperience) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <p className="px-6 py-12 text-ink-soft">Loading experience...</p>
      </div>
    )
  }

  if (loadError || !experience) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <p className="px-6 py-12 text-red-500">
          Couldn't load this experience. It may not exist, or you may not have access to it.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-medium text-ink">Edit experience</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              experience.status === 'published'
                ? 'bg-accent/15 text-accent'
                : 'bg-ink-soft/10 text-ink-soft'
            }`}
          >
            {experience.status}
          </span>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink">Cover image</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                {coverPreview || coverImageUrl ? (
                  <img
                    src={coverPreview ?? coverImageUrl ?? ''}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-ink-soft">No image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-soft"
              />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-ink">Date</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate ?? ''}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
            />
          </div>

                    <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-ink">
              Who can see this once published
            </label>
           <select
  id="visibility"
  value={visibility}
  onChange={(e) => handleVisibilityChange(e.target.value as 'private' | 'invite_only')}
  className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
>
              <option value="private">Only me</option>
              <option value="invite_only">Only people I invite</option>
            </select>

            {visibility === 'invite_only' && <InviteSection experienceId={experience.id} />}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-ink transition hover:border-accent-soft disabled:opacity-50"
            >
              {experience.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="ml-auto rounded-full px-6 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
               </form>

        <div className="mt-14 space-y-12 border-t border-border pt-10">
          <PhotoGallerySection experienceId={experience.id} />
          <SongsSection experienceId={experience.id} />
          <TimelineSection experienceId={experience.id} />
          <PeopleSection experienceId={experience.id} />
        </div>
      </div>
    </div>
  )
}
