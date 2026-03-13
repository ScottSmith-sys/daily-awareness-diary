import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDisplayDate } from '@/lib/utils'
import { QUESTIONS } from '@/lib/questions'
import Card from '@/components/ui/Card'

export default async function EntryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entry } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user!.id)
    .eq('entry_date', date)
    .single()

  if (!entry) redirect('/entries')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/entries" className="text-sm text-[#0079a7] hover:underline">← Back</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">{formatDisplayDate(date)}</h1>
      </div>

      <Card>
        <div className="space-y-8">
          {QUESTIONS.map((q, i) => {
            const answer = entry[q.id as keyof typeof entry] as string | null
            return (
              <div key={q.id} className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#0079a7]">
                  {i + 1}. {q.label}
                </span>
                <p className="text-sm text-slate-500">{q.prompt}</p>
                <p className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
                  {answer?.trim() || <span className="text-slate-300 italic">No response</span>}
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
