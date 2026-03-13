import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InsightReport from '@/components/diary/InsightReport'
import ReportExport from '@/components/diary/ReportExport'

export const dynamic = 'force-dynamic'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: report } = await supabase
    .from('insight_reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!report) notFound()

  const createdAt = new Date(report.created_at)
  const displayDate = createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const exportDate = createdAt.toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/reports" className="text-sm text-[#0079a7] hover:underline">
            ← All reports
          </Link>
          <p className="text-xs text-slate-400 mt-1">{displayDate}</p>
        </div>
        <ReportExport
          report={report.report_text}
          createdAt={exportDate}
          entryCount={report.entry_count}
        />
      </div>

      <InsightReport
        report={report.report_text}
        entryCount={report.entry_count}
        emailSent={false}
      />

      <div className="flex justify-between items-center pt-2">
        <Link href="/reports" className="text-sm text-slate-400 hover:text-slate-600">
          ← All reports
        </Link>
        <Link
          href="/insight-report"
          className="text-sm text-[#0079a7] hover:underline"
        >
          Generate a new report →
        </Link>
      </div>
    </div>
  )
}
