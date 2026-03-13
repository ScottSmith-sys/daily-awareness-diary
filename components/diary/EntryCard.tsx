import Link from 'next/link'
import { formatDisplayDate } from '@/lib/utils'

interface EntryCardProps {
  entry: {
    entry_date: string
    q1: string | null
  }
}

export default function EntryCard({ entry }: EntryCardProps) {
  const preview = entry.q1?.trim().slice(0, 120) || 'No response recorded.'

  return (
    <Link href={`/entries/${entry.entry_date}`}>
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-[#0079a7] hover:shadow-md transition cursor-pointer">
        <p className="text-xs font-semibold text-[#0079a7] uppercase tracking-wide mb-1">
          {formatDisplayDate(entry.entry_date)}
        </p>
        <p className="text-sm text-slate-600 line-clamp-2">{preview}</p>
      </div>
    </Link>
  )
}
