'use client'

import { useRouter } from 'next/navigation'

export interface DateInfo {
  date: string
  hasEntry: boolean
  isToday: boolean
  label: string
  dayNum: string
}

interface DateSelectorProps {
  dates: DateInfo[]
  selectedDate: string
}

export default function DateSelector({ dates, selectedDate }: DateSelectorProps) {
  const router = useRouter()

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {dates.map(d => {
        const isSelected = d.date === selectedDate
        return (
          <button
            key={d.date}
            onClick={() => router.push(`/dashboard?date=${d.date}`)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 min-w-[52px] transition-all focus:outline-none focus:ring-2 focus:ring-[#0079a7] focus:ring-offset-1 ${
              isSelected
                ? 'bg-[#0079a7] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0079a7] hover:text-[#0079a7]'
            }`}
          >
            <span className={`text-xs font-medium leading-none ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
              {d.label}
            </span>
            <span className="text-sm font-bold leading-none mt-0.5">{d.dayNum}</span>
            <div
              title={d.hasEntry ? 'Entry exists' : 'No entry'}
              className={`mt-0.5 h-1.5 w-1.5 rounded-full transition-colors ${
                d.hasEntry
                  ? isSelected
                    ? 'bg-white'
                    : 'bg-[#0079a7]'
                  : isSelected
                    ? 'bg-blue-400 opacity-40'
                    : 'bg-slate-200'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
