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
  const {
    experience,
    loading: loadingExperience,
    error: loadError,
  } = useExperience(id)

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<
    'private' | 'unlisted' | 'invite_only'
  >('private')
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!experience) return

    setTitle(experience.title)
    setLocation(experience.location ?? '')
    setEventDate(experience.event_date ?? '')
    setDescription(experience.description ?? '')
    setCoverImageUrl(experience.cover_image_url)
    setVisibility(
      experience.visibility as 'private' | 'unlisted' | 'invite_only'
    )
  }, [experience])

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
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

  async function uploadNewCoverIfNeeded() {
    if (!coverFile || !user) return coverImageUrl

    const fileExt = coverFile.name.split('.').pop()
    const filePath = user.id + '/' + crypto.randomUUID() + '.' + fileExt

    const { error: uploadError } = await supabase.storage
      .from('experience-images')
      .upload(filePath, coverFile)

    if (uploadError) {
      throw new Error('Image upload failed: ' + uploadError.message)
    }

    const { data } = supabase.storage
      .from('experience-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async function handleCopyLink() {
    if (!experience?.share_slug) return

    const url = `${window.location.origin}/experience/${experience.share_slug}`

    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)

      window.setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch {
      setError('Could not copy the link. Please copy it manually.')
    }
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

      if (updateError) {
        throw new Error(updateError.message)
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleVisibilityChange(
    newVisibility: 'private' | 'unlisted' | 'invite_only'
  ) {
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

  async function handleDelete() {
    if (!id) return

    const confirmed = window.confirm(
      'Delete this experience permanently? This will also delete all its photos, songs, timeline entries, and people. This cannot be undone.'
    )

    if (!confirmed) return

    setSaving(true)

    const { error: deleteError } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)

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
        <main className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-ink-soft">Loading experience...</p>
        </main>
      </div>
    )
  }

  if (loadError || !experience) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-serif text-2xl text-ink">
              Could not load this experience
            </p>
            <p className="mt-2 text-sm text-red-500">
              It may not exist, or you may not have access to it.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const publicUrl =
    window.location.origin + '/experience/' + experience.share_slug

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Your memory
            </p>

            <h1 className="mt-2 font-serif text-4xl font-medium text-ink sm:text-5xl">
              Edit experience
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Shape the details, collect the moments, and decide who gets to
              relive them.
            </p>
          </div>

          <span className="w-fit rounded-full bg-ink-soft/10 px-3 py-1 text-xs font-medium capitalize text-ink-soft">
            {experience.status}
          </span>
        </header>

        {/* Share card */}
        {experience.status === 'published' && experience.share_slug ? (
          <section className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  Sharing
                </p>

                <h2 className="mt-2 font-serif text-2xl text-ink">
                  Share this experience
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {visibility === 'unlisted'
                    ? 'Anyone with this link can view it. It will not appear in other users’ dashboards.'
                    : visibility === 'invite_only'
                      ? 'Only people you invite can view this experience.'
                      : 'This experience is private and cannot be viewed through this link.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-4 py-3">
                <p className="truncate text-sm text-ink-soft">{publicUrl}</p>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-soft"
              >
                {linkCopied ? '✓ Link copied' : 'Copy link'}
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-accent-soft hover:bg-bg"
              >
                Open
              </a>
            </div>
          </section>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main details */}
          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Details
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
                Experience details
              </h2>

              <p className="mt-2 text-sm text-ink-soft">
                Start with the details that set the scene.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-7">
              {/* Cover */}
              <div>
                <label className="block text-sm font-medium text-ink">
                  Cover image
                </label>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-bg sm:h-32 sm:w-48">
                    {coverPreview || coverImageUrl ? (
                      <img
                        src={coverPreview ?? coverImageUrl ?? ''}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-ink-soft">No image</p>
                        <p className="mt-1 text-xs text-ink-soft/70">
                          JPG, PNG or WebP
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      id="cover-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />

                    <label
                      htmlFor="cover-image"
                      className="inline-flex cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft"
                    >
                      Choose image
                    </label>

                    <p className="mt-2 text-xs text-ink-soft">
                      Maximum 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-ink"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this memory a name"
                  className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
                />
              </div>

              {/* Location + Date */}
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-ink"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where did it happen?"
                    className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-sm font-medium text-ink"
                  >
                    Date
                  </label>

                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate ?? ''}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink focus:border-accent-soft focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-ink"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this moment worth remembering?"
                  rows={6}
                  className="mt-2 w-full resize-y rounded-xl border border-border bg-bg px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
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
                  {experience.status === 'published'
                    ? 'Unpublish'
                    : 'Publish'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="ml-auto rounded-full px-5 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </form>
          </section>

          {/* Visibility */}
          <aside className="h-fit rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Privacy
            </p>

            <h2 className="mt-2 font-serif text-2xl font-medium text-ink">
              Who can see it?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Choose who can access this memory once it is published.
            </p>

            <label
              htmlFor="visibility"
              className="mt-6 block text-sm font-medium text-ink"
            >
              Visibility
            </label>

            <select
              id="visibility"
              value={visibility}
              onChange={(e) =>
                handleVisibilityChange(
                  e.target.value as
                    | 'private'
                    | 'unlisted'
                    | 'invite_only'
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink focus:border-accent-soft focus:outline-none"
            >
              <option value="private">Only me</option>
              <option value="unlisted">Anyone with the link</option>
              <option value="invite_only">Only people I invite</option>
            </select>

            <div className="mt-5 rounded-xl bg-bg p-4">
              <p className="text-sm font-medium text-ink">
                {visibility === 'private'
                  ? '🔒 Private'
                  : visibility === 'unlisted'
                    ? '🔗 Link sharing'
                    : '✉️ Invite only'}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {visibility === 'private'
                  ? 'Only you can access this experience.'
                  : visibility === 'unlisted'
                    ? 'Anyone who has the link can access it.'
                    : 'Only invited email addresses can access it.'}
              </p>
            </div>

            {visibility === 'invite_only' ? (
              <div className="mt-6 border-t border-border pt-6">
                <InviteSection experienceId={experience.id} />
              </div>
            ) : null}
          </aside>
        </div>

        {/* Memory building sections */}
        <section className="mt-10">
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Build the memory
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
              The moments inside it
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Add photos, songs, timeline moments, and the people who made the
              experience meaningful.
            </p>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <PhotoGallerySection experienceId={experience.id} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <SongsSection experienceId={experience.id} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <TimelineSection experienceId={experience.id} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <PeopleSection experienceId={experience.id} />
            </div>
          </div>
        </section>

        {/* Closing */}
        <div className="mt-16 border-t border-border pt-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Afterglow
          </p>

          <p className="mx-auto mt-3 max-w-lg font-serif text-2xl italic text-ink">
            Some moments deserve to stay.
          </p>
        </div>
      </main>
    </div>
  )
}