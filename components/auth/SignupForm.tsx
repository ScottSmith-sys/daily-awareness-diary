'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-slate-800">Account created!</p>
        <p className="text-sm text-slate-500">Check your email to confirm your account, then sign in.</p>
        <Link href="/login" className="text-sm text-[#0079a7] hover:underline block mt-4">
          Go to sign in
        </Link>
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
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="••••••••"
        required
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>

      <p className="text-sm text-center text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0079a7] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
