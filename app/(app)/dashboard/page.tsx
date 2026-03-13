import { createClient } from '@/lib/supabase/server'
import { getTodayDate, formatDisplayDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import DiaryForm from '@/components/diary/DiaryForm'
import Link from 'next/link'

const UNLOCK_AT = 14
const FULL_REPORT_AT = 21

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

  const n = entryCount ?? 0
  const unlocked = n >= UNLOCK_AT
  const isFull = n >= FULL_REPORT_AT
  const toUnlock = UNLOCK_AT - n
  const toFull = FULL_REPORT_AT - n

  const progressPct = Math.min(100, Math.round((n / UNLOCK_AT) * 100))

  let statusLine: string
  if (n === 0) {
    statusLine = `Write your first entry to begin building your Insight Report.`
  } else if (n < UNLOCK_AT) {
    statusLine = `You have ${n} ${n === 1 ? 'entry' : 'entries'}. ${toUnlock} more to unlock your Insight Report.`
  } else if (n < FULL_REPORT_AT) {
    statusLine = `You have ${n} entries. ${toFull} more to unlock your Full Insight Report.`
  } else {
    statusLine = `${n} entries analyzed. Your Full Insight Report is ready.`
  }

  const buttonLabel = isFull
    ? 'Generate Full Identity Insight Report'
    : 'Generate My Identity Insight Report'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Today&apos;s Entry</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDisplayDate(today)}</p>
      </div>

      <div className={`rounded-2xl border p-5 transition-all ${
        unlocked
          ? 'border-[#0079a7] bg-gradient-to-r from-[#0079a7] to-[#005f84] text-white shadow-md'
          : 'border-slate-200 bg-white text-slate-800'
      }`}>
        {/* Progress bar — only shown when not yet unlocked */}
        {!unlocked && (
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0079a7]">
                Identity Insight Report
              </span>
              <span className="text-xs text-slate-400">{n} / {UNLOCK_AT}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-[#0079a7] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {unlocked && (
              <p className="text-xs font-medium uppercase tracking-widest mb-1 text-blue-200">
                {n} entries analyzed
              </p>
            )}
            <p className={`text-sm leading-snug ${unlocked ? 'text-blue-100' : 'text-slate-500'}`}>
              {statusLine}
            </p>
          </div>
          <div className="shrink-0">
            {unlocked ? (
              <Link
                href="/insight-report"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0079a7] shadow-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {buttonLabel} →
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300 whitespace-nowrap cursor-not-allowed select-none">
                {buttonLabel}
              </div>
            )}
          </div>
        </div>

        {/* Motivating micro-copy when close to unlocking */}
        {!unlocked && n > 0 && n >= UNLOCK_AT - 3 && (
          <p className="mt-3 text-xs text-[#0079a7] font-medium">
            Almost there — keep going ✦
          </p>
        )}

        {/* Teaser when unlocked but not full */}
        {unlocked && !isFull && (
          <p className="mt-2 text-xs text-blue-200">
            {toFull} more {toFull === 1 ? 'entry' : 'entries'} to unlock your Full Report with deeper insights
          </p>
        )}
      </div>

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
