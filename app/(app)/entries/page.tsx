'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTodayDate } from '@/lib/utils'
import EntryCard from '@/components/diary/EntryCard'
import CalendarView from '@/components/diary/CalendarView'

type Entry = { entry_date: string; q1: string | null }

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const today = getTodayDate()
      const { data } = await supabase
        .from('diary_entries')
        .select('entry_date, q1')
        .neq('entry_date', today)
        .order('entry_date', { ascending: false })
      setEntries(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Past Entries</h1>
          <p className="text-sm text-slate-500 mt-1">{entries.length} entries recorded</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'list' ? 'bg-[#0079a7] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0079a7]'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'calendar' ? 'bg-[#0079a7] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0079a7]'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">No past entries yet. Keep writing — they will appear here.</p>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {entries.map(entry => (
            <EntryCard key={entry.entry_date} entry={entry} />
          ))}
        </div>
      ) : (
        <CalendarView entries={entries} />
      )}
    </div>
  )
}
