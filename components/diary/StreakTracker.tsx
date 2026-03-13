'use client'

import { useEffect, useState } from 'react'

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  last30: boolean[]
  milestone: 7 | 14 | 21 | null
}

const MILESTONES: Record<7 | 14 | 21, { emoji: string; title: string; message: string }> = {
  7:  { emoji: '🔥', title: '7-Day Streak!',  message: "A full week of self-awareness. You're building something real." },
  14: { emoji: '⚡', title: '14-Day Streak!', message: 'Two weeks strong. Your patterns are coming into focus.' },
  21: { emoji: '✦',  title: '21-Day Streak!', message: "Three weeks. This is who you are now." },
}

export default function StreakTracker({
  currentStreak,
  longestStreak,
  totalEntries,
  last30,
  milestone,
}: StreakTrackerProps) {
  const [achieved, setAchieved] = useState(false)

  useEffect(() => {
    if (milestone) {
      const t = setTimeout(() => setAchieved(true), 80)
      return () => clearTimeout(t)
    }
  }, [milestone])

  const config = milestone ? MILESTONES[milestone] : null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Achievement banner */}
      {config && (
        <div
          className={`px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white transition-all duration-500 ${
            achieved ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.emoji}</span>
            <div>
              <p className="font-bold text-sm leading-tight">{config.title}</p>
              <p className="text-xs text-amber-100 mt-0.5 leading-snug">{config.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <div className="flex flex-col items-center gap-0.5 px-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl leading-none">🔥</span>
              <span className="text-2xl font-bold text-slate-800 leading-none">{currentStreak}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentStreak === 1 ? 'day streak' : 'day streak'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-0.5 px-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-400 leading-none">↑</span>
              <span className="text-2xl font-bold text-slate-800 leading-none">{longestStreak}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">best streak</p>
          </div>

          <div className="flex flex-col items-center gap-0.5 px-2">
            <span className="text-2xl font-bold text-slate-800 leading-none">{totalEntries}</span>
            <p className="text-xs text-slate-400 mt-1">total entries</p>
          </div>
        </div>

        {/* 30-day activity grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2.5">
            Last 30 days
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}
          >
            {last30.map((hasEntry, i) => {
              const isToday = i === 29
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm transition-colors ${
                    hasEntry
                      ? isToday
                        ? 'bg-[#0079a7] ring-2 ring-[#0079a7] ring-offset-1'
                        : 'bg-[#0079a7] opacity-75'
                      : isToday
                        ? 'bg-slate-100 ring-2 ring-slate-300 ring-offset-1'
                        : 'bg-slate-100'
                  }`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-slate-300">30 days ago</span>
            <span className="text-xs text-slate-300">today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
