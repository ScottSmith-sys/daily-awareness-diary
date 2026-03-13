import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc]">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-[#0079a7]">Daily Awareness Diary</h1>
        <p className="text-slate-500 text-lg">Reflect daily. Understand yourself.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">Create Account</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
