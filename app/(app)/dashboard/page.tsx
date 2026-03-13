import { createClient } from '@/lib/supabase/server'
import { getTodayDate, formatDisplayDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import DiaryForm from '@/components/diary/DiaryForm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayDate()

  const { data: entry } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user!.id)
    .eq('entry_date', today)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Today&apos;s Entry</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDisplayDate(today)}</p>
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
