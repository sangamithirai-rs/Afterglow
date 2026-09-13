import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function CreateExperiencePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const { error: insertError } = await supabase.from('experiences').insert({
      user_id: user.id,
      title: title.trim(),
      location: location.trim() || null,
      event_date: eventDate || null,
      description: description.trim() || null,
      status: 'draft',
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-serif text-3xl font-medium text-ink">
          Create a new experience
        </h1>
        <p className="mt-2 text-ink-soft">
          Start with the basics — you can always come back and add more.
        </p>

        <form onSubmit={handleSaveDraft} className="mt-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A week in Lisbon"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lisbon, Portugal"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-ink">
              Date
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink focus:border-accent-soft focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What made this worth remembering?"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>
        </form>
      </div>
    </div>
  )
}