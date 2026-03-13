'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import InsightReport from '@/components/diary/InsightReport'

type State =
  | { status: 'loading'; charCount: number }
  | { status: 'done'; report: string; entryCount: number; emailSent: boolean }
  | { status: 'error'; message: string }

export default function InsightReportPage() {
  const [state, setState] = useState<State>({ status: 'loading', charCount: 0 })
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    let reportText = ''
    let charCount = 0

    async function generate() {
      try {
        const response = await fetch('/api/insight-report', { method: 'POST' })

        if (!response.ok) {
          const data = await response.json()
          setState({ status: 'error', message: data.error || 'Failed to generate report.' })
          return
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                setState({ status: 'error', message: data.error })
                return
              }

              if (data.done) {
                setState({
                  status: 'done',
                  report: reportText,
                  entryCount: data.entryCount ?? 0,
                  emailSent: data.emailSent ?? false,
                })
                return
              }

              if (data.text) {
                reportText += data.text
                charCount += data.text.length
                setState({ status: 'loading', charCount })
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }
      } catch {
        setState({ status: 'error', message: 'Something went wrong. Please try again.' })
      }
    }

    generate()
  }, [])

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">{state.message}</p>
        <Link
          href="/dashboard"
          className="text-sm text-[#0079a7] underline underline-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-[#0079a7] animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Generating your Identity Insight Report
        </h2>
        <p className="text-slate-500 text-sm mb-1">
          Analyzing your diary entries for patterns and insights...
        </p>
        {state.charCount > 0 && (
          <p className="text-xs text-slate-400 mt-3 tabular-nums">
            {state.charCount.toLocaleString()} characters written
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">This takes about 30–60 seconds</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-[#0079a7] hover:underline"
        >
          ← Back to dashboard
        </Link>
        <button
          onClick={() => {
            hasFetched.current = false
            setState({ status: 'loading', charCount: 0 })
          }}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Regenerate
        </button>
      </div>
      <InsightReport
        report={state.report}
        entryCount={state.entryCount}
        emailSent={state.emailSent}
      />
    </div>
  )
}
