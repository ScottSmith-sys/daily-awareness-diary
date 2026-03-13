'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname.startsWith(path)
        ? 'text-[#0079a7]'
        : 'text-slate-500 hover:text-[#0079a7]'
    }`

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-[#0079a7] text-base">
          Daily Awareness
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className={linkClass('/dashboard')}>Today</Link>
          <Link href="/entries" className={linkClass('/entries')}>Past Entries</Link>
          <Link href="/reports" className={linkClass('/reports')}>Reports</Link>
          <Link href="/account" className={linkClass('/account')}>Account</Link>
          <Button variant="ghost" onClick={signOut} className="text-sm">Sign Out</Button>
        </div>
      </div>
    </nav>
  )
}
