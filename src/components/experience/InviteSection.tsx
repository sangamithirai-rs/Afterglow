import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useInvites } from '../../hooks/useInvites'

export function InviteSection({ experienceId }: { experienceId: string }) {
  const { invites, loading, refetch } = useInvites(experienceId)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('experience_invites').insert({
      experience_id: experienceId,
      email: trimmed,
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'Already invited.' : insertError.message)
      return
    }

    setEmail('')
    refetch()
  }

  async function handleRemove(inviteId: string) {
    await supabase.from('experience_invites').delete().eq('id', inviteId)
    refetch()
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-medium text-ink">Invited viewers</p>
      <p className="mt-1 text-xs text-ink-soft">
        Only these people can view this experience — and only if they sign in with this exact email.
      </p>

      <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="someone@example.com"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink focus:border-accent-soft focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          Invite
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {!loading && invites.length > 0 && (
        <ul className="mt-3 space-y-1">
          {invites.map((invite) => (
            <li key={invite.id} className="flex items-center justify-between text-sm text-ink">
              {invite.email}
              <button type="button" onClick={() => handleRemove(invite.id)} className="text-xs text-ink-soft hover:text-red-500">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}