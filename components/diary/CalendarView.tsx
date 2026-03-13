'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CalendarViewProps {
  entries: { entry_date: string }[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarView({ entries }: CalendarViewProps) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const entryDates = new Set(entries.map(e => e.entry_date))

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-slate-500 hover:text-[#0079a7] px-2 py-1 rounded">‹</button>
        <span className="font-semibold text-slate-800">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="text-slate-500 hover:text-[#0079a7] px-2 py-1 rounded">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const ds = dateStr(day)
          const hasEntry = entryDates.has(ds)
          const isToday = ds === today.toLocaleDateString('en-CA')

          return (
            <button
              key={day}
              onClick={() => hasEntry && router.push(`/entries/${ds}`)}
              className={`relative flex items-center justify-center h-9 w-full rounded-lg text-sm transition
                ${isToday ? 'border border-[#0079a7] font-semibold' : ''}
                ${hasEntry ? 'cursor-pointer hover:bg-[#e6f4f9] text-slate-800' : 'text-slate-400 cursor-default'}
              `}
            >
              {day}
              {hasEntry && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0079a7]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
