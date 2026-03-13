import { createClient } from '@/lib/supabase/server'
import { getTodayDate, formatDisplayDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import DiaryForm from '@/components/diary/DiaryForm'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayDate()

  const [{ data: entry }, { count: entryCount }] = await Promise.all([
    supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user!.id)
      .eq('entry_date', today)
      .single(),
    supabase
      .from('diary_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
  ])

  const totalEntries = entryCount ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Today&apos;s Entry</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDisplayDate(today)}</p>
      </div>

      {totalEntries >= 21 && (
        <Link href="/insight-report">
          <div className="rounded-2xl bg-gradient-to-r from-[#0079a7] to-[#005f84] p-5 text-white cursor-pointer hover:opacity-95 transition-opacity">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-blue-200 mb-1">
                  {totalEntries} entries analyzed
                </p>
                <h2 className="text-lg font-bold">Generate My Identity Insight Report</h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  Discover your values, beliefs, and natural life direction →
                </p>
              </div>
              <div className="ml-4 shrink-0 text-3xl opacity-80">✦</div>
            </div>
          </div>
        </Link>
      )}

      {totalEntries > 0 && totalEntries < 21 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {21 - totalEntries} more {21 - totalEntries === 1 ? 'entry' : 'entries'} until your Identity Insight Report unlocks
        </div>
      )}

      <Card>
        <DiaryForm
          initialData={entry ?? null}
          entryDate={today}
          userId={user!.id}
        />
      </Card>
    </div>
  )
}
