'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AccountForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message) }
    else { setSuccess('Password updated.'); setPassword(''); setConfirm('') }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h2 className="font-semibold text-slate-700">Change Password</h2>
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button type="submit" loading={loading}>Update Password</Button>
      </form>

      <div className="border-t border-slate-100 pt-6">
        <h2 className="font-semibold text-slate-700 mb-3">Sign Out</h2>
        <Button variant="secondary" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}
