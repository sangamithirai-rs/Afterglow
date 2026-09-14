import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Cropper, { type Area } from 'react-easy-crop'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

function createCroppedImage(
  imageSrc: string,
  crop: Area,
  outputWidth = 1600,
  outputHeight = 700,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight

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
        outputWidth,
        outputHeight,
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

export function CreateExperiencePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }

      if (cropImage) {
        URL.revokeObjectURL(cropImage)
      }
    }
  }, [coverPreview, cropImage])

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

    setCoverFile(file)
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

  async function handleSaveDraft(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Give your experience a title before saving.')
      return
    }

    if (!user) {
      setError('You must be signed in to create an experience.')
      return
    }

    setSaving(true)

    let coverImageUrl: string | null = null

    if (coverFile) {
      const filePath = `${user.id}/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('experience-images')
        .upload(filePath, coverFile, {
          contentType: 'image/jpeg',
        })

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('experience-images')
        .getPublicUrl(filePath)

      coverImageUrl = publicUrlData.publicUrl
    }

    const { data: inserted, error: insertError } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        title: title.trim(),
        location: location.trim() || null,
        event_date: eventDate || null,
        description: description.trim() || null,
        cover_image_url: coverImageUrl,
        status: 'draft',
      })
      .select()
      .single()

    setSaving(false)

    if (insertError || !inserted) {
      setError(insertError?.message ?? 'Something went wrong.')
      return
    }

    navigate(`/experiences/${inserted.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14 md:py-16">
        {/* Header */}
        <header className="border-b border-border pb-8 sm:pb-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft transition hover:text-ink"
          >
            ← Back to memories
          </button>

          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
              A new memory
            </p>

            <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Create an experience
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Start with the details that set the scene. You can add photos,
              songs, people, and a timeline afterwards.
            </p>
          </div>
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
              Start with the details that make the moment yours.
            </p>
          </div>

          <form onSubmit={handleSaveDraft}>
            {/* Cover */}
            <div>
              <label className="text-sm font-medium text-ink">
                Cover image
              </label>

              <p className="mt-1 text-xs text-ink-soft">
                Choose the image that introduces this memory.
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="aspect-square w-full">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-ink-soft">
                        No cover image selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-ink-soft">
                    JPG, PNG or WebP · Max 5MB
                  </p>

                  <label
                    htmlFor="cover-image"
                    className="w-fit cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium text-ink transition hover:border-accent-soft hover:bg-bg"
                  >
                    {coverPreview ? 'Change cover' : 'Choose cover'}
                  </label>

                  <input
                    id="cover-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
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
              <div className="grid gap-6 sm:grid-cols-2">
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
                  rows={4}
                  placeholder="What made this worth remembering?"
                  className="mt-3 w-full resize-y border-b border-border bg-transparent px-0 py-3 text-base leading-relaxed text-ink placeholder:text-ink-soft/40 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 border-l-2 border-red-500 px-4 py-2">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Action */}
            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-7 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50 sm:w-auto"
              >
                {saving ? 'Creating...' : 'Create experience'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={saving}
                className="w-full rounded-full border border-border px-7 py-3 text-sm font-medium text-ink transition hover:border-accent-soft disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>

        {/* Closing */}
        <footer className="border-t border-border py-10 text-center">
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
              </div>

              <button
                type="button"
                onClick={handleCancelCrop}
                className="text-sm text-ink-soft transition hover:text-ink"
              >
                Cancel
              </button>
            </div>

            {/* Crop area */}
            <div className="relative h-[55vh] min-h-[320px] w-full bg-black">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 7}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                objectFit="horizontal-cover"
                showGrid
              />
            </div>

            {/* Controls */}
            <div className="border-t border-border px-5 py-5">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
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