import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
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

  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [visibility, setVisibility] = useState<
    'private' | 'unlisted' | 'invite_only'
  >('private')

  const [linkCopied, setLinkCopied] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!experience) return

    setTitle(experience.title)
    setLocation(experience.location ?? '')
    setEventDate(experience.event_date ?? '')
    setDescription(experience.description ?? '')
    setCoverImageUrl(experience.cover_image_url)
    setVisibility(
      experience.visibility as 'private' | 'unlisted' | 'invite_only',
    )
  }, [experience])
  /* eslint-enable react-hooks/set-state-in-effect */

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
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB.')
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
      setError('Could not crop the image. Please try again.')
    }
  }

  function handleCancelCrop() {
    if (cropImage) {
      URL.revokeObjectURL(cropImage)
    }

    setCropImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
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
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleVisibilityChange(
    newVisibility: 'private' | 'unlisted' | 'invite_only',
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
      'Delete this experience permanently? This will also delete all its photos, songs, timeline entries, and people. This cannot be undone.',
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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="border-b border-border pb-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft transition hover:text-ink"
          >
            ← Back to memories
          </button>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
                Afterglow
              </p>

              <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
                Edit experience
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                Shape the details and keep the moments that matter.
              </p>
            </div>

            <span className="w-fit rounded-full bg-ink-soft/10 px-3 py-1.5 text-xs font-medium capitalize text-ink-soft">
              {experience.status}
            </span>
          </div>

          {/* Existing share controls */}
          {experience.status === 'published' &&
          experience.share_slug ? (
            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
                  Published experience
                </p>

                <p className="mt-1 truncate text-sm text-ink">
                  {publicUrl}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-ink transition hover:border-accent-soft hover:bg-surface"
                >
                  {linkCopied ? '✓ Copied' : 'Copy link'}
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-ink transition hover:border-accent-soft hover:bg-surface"
                >
                  Open
                </a>
              </div>
            </div>
          ) : null}
        </header>

        {/* 01 — THE MEMORY */}
        <section className="py-10 sm:py-12">
          <div className="mb-7">
            <p className="text-xs font-medium tracking-[0.22em] text-accent">
              01
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
              The memory
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Start with the details that set the scene.
            </p>
          </div>

          <form onSubmit={handleSave}>
            {/* Cover */}
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <label className="text-sm font-medium text-ink">
                    Cover image
                  </label>

                  <p className="mt-1 text-xs text-ink-soft">
                    This becomes the visual introduction to your memory.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
               <div className="aspect-square w-full">
                  {coverPreview || coverImageUrl ? (
                    <img
                      src={coverPreview ?? coverImageUrl ?? ''}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-surface">
                      <p className="text-sm text-ink-soft">
                        No cover image
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-ink-soft">
                    JPG, PNG or WebP · Max 5MB
                  </p>

                  <input
                    id="cover-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <label
                    htmlFor="cover-image"
                    className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium text-ink transition hover:border-accent-soft hover:bg-bg"
                  >
                    Change cover
                  </label>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="mt-7 space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-ink-soft"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this memory a name"
                  className="mt-3 w-full border-b border-border bg-transparent px-0 py-3 text-2xl font-serif text-ink placeholder:text-ink-soft/40 focus:border-accent focus:outline-none sm:text-3xl"
                />
              </div>

              {/* Location + Date */}
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs font-medium uppercase tracking-[0.16em] text-ink-soft"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where did it happen?"
                    className="mt-3 w-full border-b border-border bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-xs font-medium uppercase tracking-[0.16em] text-ink-soft"
                  >
                    Date
                  </label>

                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-3 w-full border-b border-border bg-transparent px-0 py-3 text-base text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-ink-soft"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this moment worth remembering?"
                  rows={4}
                  className="mt-3 w-full resize-y border-b border-border bg-transparent px-0 py-3 text-base leading-relaxed text-ink placeholder:text-ink-soft/40 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </form>
        </section>

        {/* 02 — THE MOMENTS */}
        <section className="border-t border-border py-10 sm:py-12">
          <div className="mb-7">
            <p className="text-xs font-medium tracking-[0.22em] text-accent">
              02
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
              The moments
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Build the story with the photos, sounds, people, and moments
              that belong to it.
            </p>
          </div>

          <div className="space-y-10">
            {/* Photos */}
            <div>
              <div className="mb-5">
                <h3 className="font-serif text-2xl text-ink">
                  Photos
                </h3>

                <p className="mt-1 text-sm text-ink-soft">
                  A collection of moments captured along the way.
                </p>
              </div>

              <PhotoGallerySection experienceId={experience.id} />
            </div>

            {/* Videos */}
            <div className="border-t border-border pt-8">
              <div className="mb-5">
                <h3 className="font-serif text-2xl text-ink">
                  Videos
                </h3>

                <p className="mt-1 text-sm text-ink-soft">
                  Moving moments that bring the memory back to life.
                </p>
              </div>

              <VideosSection experienceId={experience.id} />
            </div>

            {/* Songs */}
            <div className="border-t border-border pt-8">
              <div className="mb-5">
                <h3 className="font-serif text-2xl text-ink">
                  Songs
                </h3>

                <p className="mt-1 text-sm text-ink-soft">
                  The soundtrack of the memory.
                </p>
              </div>

              <SongsSection experienceId={experience.id} />
            </div>

            {/* Timeline */}
            <div className="border-t border-border pt-8">
              <div className="mb-5">
                <h3 className="font-serif text-2xl text-ink">
                  Timeline
                </h3>

                <p className="mt-1 text-sm text-ink-soft">
                  How the day or trip unfolded.
                </p>
              </div>

              <TimelineSection experienceId={experience.id} />
            </div>

            {/* People */}
            <div className="border-t border-border pt-8">
              <div className="mb-5">
                <h3 className="font-serif text-2xl text-ink">
                  People
                </h3>

                <p className="mt-1 text-sm text-ink-soft">
                  The people who were there.
                </p>
              </div>

              <PeopleSection experienceId={experience.id} />
            </div>
          </div>
        </section>

        {/* 03 — SHARING */}
        <section className="border-t border-border py-14 sm:py-16">
          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.22em] text-accent">
              03
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium text-ink">
              Sharing
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Decide who can relive this memory once it is published.
            </p>
          </div>

          <div className="space-y-3">
            {/* Private */}
            <label
              className={`block cursor-pointer border px-5 py-5 transition ${
                visibility === 'private'
                  ? 'border-accent bg-surface'
                  : 'border-border hover:border-accent-soft'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  className="mt-1"
                />

                <div>
                  <p className="text-sm font-medium text-ink">
                    Only me
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Only you can view this experience.
                  </p>
                </div>
              </div>
            </label>

            {/* Unlisted */}
            <label
              className={`block cursor-pointer border px-5 py-5 transition ${
                visibility === 'unlisted'
                  ? 'border-accent bg-surface'
                  : 'border-border hover:border-accent-soft'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="visibility"
                  value="unlisted"
                  checked={visibility === 'unlisted'}
                  onChange={() => handleVisibilityChange('unlisted')}
                  className="mt-1"
                />

                <div>
                  <p className="text-sm font-medium text-ink">
                    Anyone with the link
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Anyone who has the link can view it. It will not appear
                    in other users’ dashboards.
                  </p>
                </div>
              </div>
            </label>

            {/* Invite only */}
            <label
              className={`block cursor-pointer border px-5 py-5 transition ${
                visibility === 'invite_only'
                  ? 'border-accent bg-surface'
                  : 'border-border hover:border-accent-soft'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="visibility"
                  value="invite_only"
                  checked={visibility === 'invite_only'}
                  onChange={() =>
                    handleVisibilityChange('invite_only')
                  }
                  className="mt-1"
                />

                <div>
                  <p className="text-sm font-medium text-ink">
                    Only people I invite
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Only invited people can view this experience.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {visibility === 'invite_only' ? (
            <div className="mt-8 border-t border-border pt-8">
              <InviteSection experienceId={experience.id} />
            </div>
          ) : null}
        </section>

        {/* ACTIONS */}
        <section className="border-t border-border py-8">
          {error ? (
            <div className="mb-6 border-l-2 border-red-500 px-4 py-2">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={saving}
              onClick={(e) => {
                const form = e.currentTarget
                  .closest('main')
                  ?.querySelector('form')

                if (form) {
                  form.requestSubmit()
                }
              }}
              className="w-full rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50 sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className="w-full rounded-full border border-border px-7 py-3 text-sm font-medium text-ink transition hover:border-accent-soft disabled:opacity-50 sm:w-auto"
            >
              {experience.status === 'published'
                ? 'Unpublish'
                : 'Publish'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-sm font-medium text-red-500 transition hover:text-red-600 sm:ml-auto"
            >
              Delete experience
            </button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-soft">
            Save your changes before leaving this page.
          </p>
        </section>

        {/* Closing */}
        <footer className="border-t border-border py-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Afterglow
          </p>

          <p className="mt-3 font-serif text-xl italic text-ink-soft">
            A memory worth keeping.
          </p>
        </footer>
      </main>

      {/* Crop modal */}
      {cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  Cover image
                </p>

                <h2 className="mt-1 font-serif text-xl font-medium text-ink">
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
                <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-ink-soft">
                  Zoom
                </span>

                <input
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