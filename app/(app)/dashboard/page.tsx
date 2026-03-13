import { createClient } from '@/lib/supabase/server'
import {
  getTodayDate,
  formatDisplayDate,
  calcCurrentStreak,
  calcLongestStreak,
  getLast30Activity,
} from '@/lib/utils'
import Card from '@/components/ui/Card'
import DiaryForm from '@/components/diary/DiaryForm'
import DateSelector from '@/components/diary/DateSelector'
import StreakTracker from '@/components/diary/StreakTracker'
import type { DateInfo } from '@/components/diary/DateSelector'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const UNLOCK_AT = 3
const FULL_REPORT_AT = 21

function getLastSevenDates(today: string): string[] {
  const [y, m, d] = today.split('-').map(Number)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(y, m - 1, d - i)
    dates.push(date.toLocaleDateString('en-CA'))
  }
  return dates
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayDate()
  const sevenDates = getLastSevenDates(today)

  const selectedDate =
    params.date && sevenDates.includes(params.date) ? params.date : today

  const [{ data: weekEntries }, { data: allDateRows }] = await Promise.all([
    supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user!.id)
      .in('entry_date', sevenDates),
    supabase
      .from('diary_entries')
      .select('entry_date')
      .eq('user_id', user!.id),
  ])

  const entryMap = new Map((weekEntries ?? []).map(e => [e.entry_date, e]))
  const selectedEntry = entryMap.get(selectedDate) ?? null

  const allDates = (allDateRows ?? []).map(r => r.entry_date as string)
  const allDateSet = new Set(allDates)
  const n = allDates.length

  const currentStreak = calcCurrentStreak(allDateSet, today)
  const longestStreak = calcLongestStreak(allDates)
  const last30 = getLast30Activity(allDateSet, today)

  const todayHasEntry = allDateSet.has(today)
  const MILESTONES = [7, 14, 21] as const
  const milestone = todayHasEntry && MILESTONES.includes(currentStreak as 7 | 14 | 21)
    ? (currentStreak as 7 | 14 | 21)
    : null

  const dateInfos: DateInfo[] = sevenDates.map(date => {
    const [y, m, d] = date.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return {
      date,
      hasEntry: entryMap.has(date),
      isToday: date === today,
      label: date === today ? 'Today' : DAY_LABELS[dateObj.getDay()],
      dayNum: String(d),
    }
  })

  const isToday = selectedDate === today
  const heading = isToday ? "Today's Entry" : formatDisplayDate(selectedDate)
  const subheading = isToday ? formatDisplayDate(today) : selectedEntry ? 'Editing existing entry' : 'No entry yet — start writing'

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
        <h1 className="text-2xl font-bold text-slate-800">{heading}</h1>
        <p className="text-sm text-slate-500 mt-1">{subheading}</p>
      </div>

      <DateSelector dates={dateInfos} selectedDate={selectedDate} />

      <StreakTracker
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalEntries={n}
        last30={last30}
        milestone={milestone}
      />

      {/* Insight Report banner */}
      <div className={`rounded-2xl border p-5 transition-all ${
        unlocked
          ? 'border-[#0079a7] bg-gradient-to-r from-[#0079a7] to-[#005f84] text-white shadow-md'
          : 'border-slate-200 bg-white text-slate-800'
      }`}>
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

        {!unlocked && n > 0 && n >= UNLOCK_AT - 3 && (
          <p className="mt-3 text-xs text-[#0079a7] font-medium">
            Almost there — keep going ✦
          </p>
        )}

        {unlocked && !isFull && (
          <p className="mt-2 text-xs text-blue-200">
            {toFull} more {toFull === 1 ? 'entry' : 'entries'} to unlock your Full Report with deeper insights
          </p>
        )}
      </div>

      <Card>
        <DiaryForm
          key={selectedDate}
          initialData={selectedEntry}
          entryDate={selectedDate}
          userId={user!.id}
        />
      </Card>
    </div>
  )
}
