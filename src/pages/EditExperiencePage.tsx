import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Cropper, { type Area } from 'react-easy-crop'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useExperience } from '../hooks/useExperience'
import { supabase } from '../lib/supabase'
import { PhotoGallerySection } from '../components/experience/PhotoGallerySection'
import { SongsSection } from '../components/experience/SongsSection'
import { TimelineSection } from '../components/experience/TimelineSection'
import { PeopleSection } from '../components/experience/PeopleSection'
import { InviteSection } from '../components/experience/InviteSection'
import { VideosSection } from '../components/experience/VideosSection'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

type Visibility = 'private' | 'unlisted' | 'invite_only'

const VISIBILITY_OPTIONS: {
  value: Visibility
  label: string
  description: string
}[] = [
  {
    value: 'private',
    label: 'Only me',
    description: 'Only you can view this experience.',
  },
  {
    value: 'unlisted',
    label: 'Anyone with the link',
    description:
      'Anyone who has the link can view it. It will not appear in other users’ dashboards.',
  },
  {
    value: 'invite_only',
    label: 'Only people I invite',
    description: 'Only the people you invite by email can view it.',
  },
]

/** The last values known to be saved, used to detect unsaved changes. */
interface Baseline {
  title: string
  location: string
  eventDate: string
  description: string
  coverImageUrl: string | null
}

// Shared styles so every field in the form looks and spaces the same.
const labelClass = 'block text-sm font-medium text-ink'
const helpClass = 'mt-1 text-xs leading-relaxed text-ink-soft'
const inputClass =
  'mt-2 w-full border-b border-border bg-transparent px-0 py-2.5 text-base text-ink transition placeholder:text-ink-soft/50 focus:border-accent focus:outline-none'
const secondaryButtonClass =
  'rounded-full border border-border px-4 py-2 text-xs font-medium text-ink transition hover:border-accent-soft hover:bg-surface'

function generateSlug() {
  return crypto.randomUUID().split('-')[0]
}

function createCroppedImage(
  imageSrc: string,
  crop: Area,
  outputSize = 1200,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not create image canvas.'))
        return
      }

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputSize,
        outputSize,
      )

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create cropped image.'))
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        0.92,
      )
    }

    image.onerror = () => {
      reject(new Error('Could not load image.'))
    }

    image.src = imageSrc
  })
}

/** A titled block inside the "Moments" section, separated from its siblings. */
function MomentsBlock({
  title,
  description,
  isFirst = false,
  children,
}: {
  title: string
  description: string
  isFirst?: boolean
  children: ReactNode
}) {
  return (
    <div className={isFirst ? '' : 'border-t border-border pt-10'}>
      <div className="mb-5">
        <h3 className="font-serif text-2xl text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>

      {children}
    </div>
  )
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
  const [baseline, setBaseline] = useState<Baseline | null>(null)

  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  )

  const [visibility, setVisibility] = useState<Visibility>('private')

  const [linkCopied, setLinkCopied] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!experience) return

    const initial: Baseline = {
      title: experience.title,
      location: experience.location ?? '',
      eventDate: experience.event_date ?? '',
      description: experience.description ?? '',
      coverImageUrl: experience.cover_image_url,
    }

    setTitle(initial.title)
    setLocation(initial.location)
    setEventDate(initial.eventDate)
    setDescription(initial.description)
    setCoverImageUrl(initial.coverImageUrl)
    setBaseline(initial)
    setVisibility(experience.visibility as Visibility)
  }, [experience])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
    }
  }, [coverPreview])

  // Success messages fade away on their own.
  useEffect(() => {
    if (!notice) return

    const timer = window.setTimeout(() => setNotice(null), 3000)

    return () => window.clearTimeout(timer)
  }, [notice])

  const isDirty =
    baseline !== null &&
    (title !== baseline.title ||
      location !== baseline.location ||
      eventDate !== baseline.eventDate ||
      description !== baseline.description ||
      coverImageUrl !== baseline.coverImageUrl ||
      coverFile !== null)

  // Warn before the tab is closed or reloaded with unsaved changes.
  useEffect(() => {
    if (!isDirty) return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  const handleCancelCrop = useCallback(() => {
    if (cropImage) {
      URL.revokeObjectURL(cropImage)
    }

    setCropImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }, [cropImage])

  // Esc closes the crop dialog.
  useEffect(() => {
    if (!cropImage) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleCancelCrop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cropImage, handleCancelCrop])

  function showNotice(text: string) {
    setNotice({ id: Date.now(), text })
  }

  function handleBack() {
    if (
      isDirty &&
      !window.confirm('You have unsaved changes. Leave without saving?')
    ) {
      return
    }

    navigate('/dashboard')
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Upload a JPEG, PNG or WebP image.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Choose an image smaller than 5MB.')
      e.target.value = ''
      return
    }

    setError(null)

    const imageUrl = URL.createObjectURL(file)

    setCropImage(imageUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)

    e.target.value = ''
  }

  function handleCropComplete(_: Area, croppedPixels: Area) {
    setCroppedAreaPixels(croppedPixels)
  }

  async function handleApplyCrop() {
    if (!cropImage || !croppedAreaPixels) return

    try {
      const croppedBlob = await createCroppedImage(
        cropImage,
        croppedAreaPixels,
      )

      const croppedFile = new File(
        [croppedBlob],
        'afterglow-cover.jpg',
        {
          type: 'image/jpeg',
        },
      )

      const newPreviewUrl = URL.createObjectURL(croppedBlob)

      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }

      setCoverFile(croppedFile)
      setCoverPreview(newPreviewUrl)

      URL.revokeObjectURL(cropImage)

      setCropImage(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    } catch {
      setError('Could not crop the image. Try again.')
    }
  }

  function handleRemoveCover() {
    setCoverFile(null)
    setCoverPreview(null)
    setCoverImageUrl(null)
  }

  async function uploadNewCoverIfNeeded() {
    if (!coverFile || !user) return coverImageUrl

    const filePath = user.id + '/' + crypto.randomUUID() + '.jpg'

    const { error: uploadError } = await supabase.storage
      .from('experience-images')
      .upload(filePath, coverFile, {
        contentType: 'image/jpeg',
      })

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

    const url =
      `${window.location.origin}/experience/${experience.share_slug}`

    try {
      await navigator.clipboard.writeText(url)

      setLinkCopied(true)

      window.setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch {
      setError('Could not copy the link. Copy it manually instead.')
    }
  }

  /** Validates and saves the details form. Returns true when saved. */
  async function persistDetails(): Promise<boolean> {
    if (!id) return false

    const cleanTitle = title.trim()

    if (!cleanTitle) {
      setError('Give your experience a title before saving.')
      return false
    }

    const cleanLocation = location.trim()
    const cleanDescription = description.trim()

    try {
      const finalCoverUrl = await uploadNewCoverIfNeeded()

      const { error: updateError } = await supabase
        .from('experiences')
        .update({
          title: cleanTitle,
          location: cleanLocation || null,
          event_date: eventDate || null,
          description: cleanDescription || null,
          cover_image_url: finalCoverUrl,
          visibility,
        })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setTitle(cleanTitle)
      setLocation(cleanLocation)
      setDescription(cleanDescription)
      setCoverImageUrl(finalCoverUrl)
      setCoverFile(null)
      setCoverPreview(null)
      setBaseline({
        title: cleanTitle,
        location: cleanLocation,
        eventDate,
        description: cleanDescription,
        coverImageUrl: finalCoverUrl,
      })

      return true
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Try again.',
      )

      return false
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const saved = await persistDetails()

    setSaving(false)

    if (saved) {
      showNotice('Changes saved')
    }
  }

  async function handleVisibilityChange(newVisibility: Visibility) {
    if (!id) return

    const previousVisibility = visibility

    setError(null)
    setVisibility(newVisibility)

    const { error: visibilityError } = await supabase
      .from('experiences')
      .update({ visibility: newVisibility })
      .eq('id', id)

    if (visibilityError) {
      setVisibility(previousVisibility)
      setError(visibilityError.message)
      return
    }

    showNotice('Sharing updated')
  }

  async function handleTogglePublish() {
    if (!experience || !id) return

    setError(null)
    setSaving(true)

    // Don't lose edits: save any pending changes before changing status.
    if (isDirty) {
      const saved = await persistDetails()

      if (!saved) {
        setSaving(false)
        return
      }
    }

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
      'Delete this experience permanently? This also deletes its photos, videos, songs, timeline entries and people. This cannot be undone.',
    )

    if (!confirmed) return

    setError(null)
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

        <main className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-sm text-ink-soft">
            Loading experience...
          </p>
        </main>
      </div>
    )
  }

  if (loadError || !experience) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />

        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="border-t border-border pt-8">
            <p className="font-serif text-3xl text-ink">
              Could not load this experience
            </p>

            <p className="mt-3 text-sm text-red-500">
              It may not exist, or you may not have access to it.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const publicUrl =
    window.location.origin +
    '/experience/' +
    experience.share_slug

  const hasCover = Boolean(coverPreview || coverImageUrl)
  const isPublished = experience.status === 'published'

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pb-36 pt-8 sm:pt-12">
        {/* Header */}
        <header className="pb-10">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-ink-soft transition hover:text-ink"
          >
            ← Back to dashboard
          </button>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-accent">Editing</p>

              <h1 className="mt-2 break-words font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
                {title.trim() || 'Untitled memory'}
              </h1>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize text-ink-soft">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  isPublished ? 'bg-accent' : 'bg-ink-soft/40'
                }`}
              />
              {experience.status}
            </span>
          </div>

          {/* Share link (published only) */}
          {isPublished && experience.share_slug ? (
            <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-ink-soft">
                  Public link
                </p>

                <p className="mt-0.5 truncate text-sm text-ink">
                  {publicUrl}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={secondaryButtonClass}
                >
                  {linkCopied ? '✓ Copied' : 'Copy link'}
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={secondaryButtonClass}
                >
                  Open
                </a>
              </div>
            </div>
          ) : null}

          {/* Jump links: this is a long page */}
          <nav
            aria-label="Sections"
            className="mt-8 flex gap-6 border-b border-border text-sm"
          >
            {[
              ['#details', 'Details'],
              ['#moments', 'Moments'],
              ['#sharing', 'Sharing'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="-mb-px border-b-2 border-transparent pb-3 text-ink-soft transition hover:border-accent hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        {/* Details */}
        <section id="details" className="scroll-mt-6 pb-14">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-medium text-ink">
              Details
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              The name, place and date that set the scene.
            </p>
          </div>

          <form
            id="experience-form"
            onSubmit={handleSave}
            className="space-y-10"
          >
            {/* Cover */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface">
                {hasCover ? (
                  <img
                    src={coverPreview ?? coverImageUrl ?? ''}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-xs text-ink-soft">
                    No cover yet
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className={labelClass}>Cover image</p>

                <p className={helpClass}>
                  The first image people see when they open your memory.
                  JPEG, PNG or WebP, up to 5MB.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label
                    className={`${secondaryButtonClass} cursor-pointer focus-within:ring-2 focus-within:ring-accent`}
                  >
                    {hasCover ? 'Change cover' : 'Upload cover'}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>

                  {hasCover ? (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="rounded-full px-3 py-2 text-xs font-medium text-ink-soft transition hover:text-red-500"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this memory a name"
                className={`${inputClass} font-serif text-2xl sm:text-3xl`}
              />
            </div>

            {/* Location + Date */}
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
              <div>
                <label htmlFor="location" className={labelClass}>
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where did it happen?"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="eventDate" className={labelClass}>
                  Date
                </label>

                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this moment worth remembering?"
                rows={4}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </div>
          </form>
        </section>

        {/* Moments */}
        <section
          id="moments"
          className="scroll-mt-6 border-t border-border py-14"
        >
          <div className="mb-10">
            <h2 className="font-serif text-3xl font-medium text-ink">
              Moments
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Add the photos, videos, songs, people and events that belong
              to this memory. These save as you add them.
            </p>
          </div>

          <div className="space-y-10">
            <MomentsBlock
              isFirst
              title="Photos"
              description="A collection of moments captured along the way."
            >
              <PhotoGallerySection experienceId={experience.id} />
            </MomentsBlock>

            <MomentsBlock
              title="Videos"
              description="Moving moments that bring the memory back to life."
            >
              <VideosSection experienceId={experience.id} />
            </MomentsBlock>

            <MomentsBlock
              title="Songs"
              description="The soundtrack of the memory."
            >
              <SongsSection experienceId={experience.id} />
            </MomentsBlock>

            <MomentsBlock
              title="Timeline"
              description="How the day or trip unfolded."
            >
              <TimelineSection experienceId={experience.id} />
            </MomentsBlock>

            <MomentsBlock
              title="People"
              description="The people who were there."
            >
              <PeopleSection experienceId={experience.id} />
            </MomentsBlock>
          </div>
        </section>

        {/* Sharing */}
        <section
          id="sharing"
          className="scroll-mt-6 border-t border-border py-14"
        >
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-medium text-ink">
              Sharing
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Choose who can view this memory once it is published. This
              saves as soon as you pick an option.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Who can view this experience"
            className="space-y-3"
          >
            {VISIBILITY_OPTIONS.map((option) => {
              const selected = visibility === option.value

              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border px-5 py-4 transition focus-within:ring-2 focus-within:ring-accent ${
                    selected
                      ? 'border-accent bg-surface'
                      : 'border-border hover:border-accent-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={selected}
                    onChange={() => handleVisibilityChange(option.value)}
                    className="mt-1 accent-accent"
                  />

                  <div>
                    <p className="text-sm font-medium text-ink">
                      {option.label}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {option.description}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>

          {visibility === 'invite_only' ? (
            <div className="mt-8 border-t border-border pt-8">
              <InviteSection experienceId={experience.id} />
            </div>
          ) : null}
        </section>

        {/* Delete */}
        <section
          id="delete"
          className="scroll-mt-6 border-t border-border py-14"
        >
          <h2 className="font-serif text-3xl font-medium text-ink">
            Delete this experience
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            This permanently removes the experience along with its photos,
            videos, songs, timeline entries and people. It can't be undone.
          </p>

          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="mt-6 rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete experience
          </button>
        </section>
      </main>

      {/* Action bar: always visible, so saving never means scrolling to the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            role="status"
            aria-live="polite"
            className={`flex min-w-0 items-center gap-2 text-sm ${
              error ? 'text-red-500' : 'text-ink-soft'
            }`}
          >
            {error ? (
              error
            ) : notice ? (
              <>✓ {notice.text}</>
            ) : isDirty ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-accent"
                />
                Unsaved changes
              </>
            ) : (
              'No unsaved changes'
            )}
          </p>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className="flex-1 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft disabled:opacity-50 sm:flex-none"
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>

            <button
              type="submit"
              form="experience-form"
              disabled={saving || !isDirty}
              className="flex-1 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50 sm:flex-none"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Crop dialog */}
      {cropImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop your cover"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl bg-surface shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-ink">
                  Crop your cover
                </h2>

                <p className="mt-1 text-xs text-ink-soft">
                  Drag the image and zoom to choose the part you want.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelCrop}
                className="text-sm text-ink-soft transition hover:text-ink"
              >
                Cancel
              </button>
            </div>

            {/* Square crop area */}
            <div className="flex items-center justify-center bg-black p-4 sm:p-8">
              <div className="relative aspect-square w-full max-w-[520px]">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  objectFit="contain"
                  showGrid
                />
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-border px-5 py-5">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="crop-zoom"
                  className="shrink-0 text-sm text-ink-soft"
                >
                  Zoom
                </label>

                <input
                  id="crop-zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="w-full rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink transition hover:border-accent-soft sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={!croppedAreaPixels}
                  className="w-full rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50 sm:w-auto"
                >
                  Apply crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
