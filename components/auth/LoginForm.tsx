'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setMagicSent(true)
        setLoading(false)
      }
    }
  }

  if (magicSent) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-slate-800">Check your email</p>
        <p className="text-sm text-slate-500">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
        <button onClick={() => setMagicSent(false)} className="text-sm text-[#0079a7] hover:underline mt-4 block mx-auto">
          Try a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      {mode === 'password' && (
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        {mode === 'password' ? 'Sign In' : 'Send Magic Link'}
      </Button>

      <button
        type="button"
        onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setError('') }}
        className="text-sm text-[#0079a7] hover:underline w-full text-center"
      >
        {mode === 'password' ? 'Sign in with magic link instead' : 'Sign in with password instead'}
      </button>

      <p className="text-sm text-center text-slate-500">
        No account?{' '}
        <Link href="/signup" className="text-[#0079a7] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}
