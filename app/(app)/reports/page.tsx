import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reports } = await supabase
    .from('insight_reports')
    .select('id, entry_count, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Your Identity Insight Reports</p>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-3xl mb-3">✦</p>
          <p className="text-slate-700 font-medium mb-1">No reports yet</p>
          <p className="text-sm text-slate-400 mb-5">
            Generate your first Identity Insight Report from the dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-[#0079a7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005f84] transition-colors"
          >
            Go to dashboard →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => {
            const date = new Date(report.created_at)
            const display = date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            const time = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })
            const isLatest = i === 0

            return (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block rounded-2xl border bg-white p-5 hover:border-[#0079a7] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isLatest && (
                        <span className="rounded-full bg-[#e6f4f9] px-2 py-0.5 text-xs font-semibold text-[#0079a7]">
                          Latest
                        </span>
                      )}
                      <p className="text-sm font-semibold text-slate-800 truncate">{display}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {time}  •  {report.entry_count} {report.entry_count === 1 ? 'entry' : 'entries'} analyzed
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#0079a7] transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Link
        href="/insight-report"
        className="block w-full rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center text-sm font-medium text-slate-400 hover:border-[#0079a7] hover:text-[#0079a7] transition-colors"
      >
        + Generate a new report
      </Link>
    </div>
  )
}
