'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InsightReportPage() {
  const router = useRouter()
  const [charCount, setCharCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    let count = 0
    let reportText = ''

    async function generate() {
      try {
        const response = await fetch('/api/insight-report', { method: 'POST' })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to generate report.')
          return
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) { setError(data.error); return }
              if (data.text) {
                reportText += data.text
                count += data.text.length
                setCharCount(count)
              }
              if (data.done) {
                if (data.reportId) {
                  router.replace(`/reports/${data.reportId}`)
                } else {
                  setError('Report generated but could not be saved. Please try again.')
                }
                return
              }
            } catch { /* ignore malformed SSE lines */ }
          }
        }
      } catch {
        setError('Something went wrong. Please try again.')
      }
    }

    generate()
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">{error}</p>
        <Link href="/dashboard" className="text-sm text-[#0079a7] underline underline-offset-2">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-[#0079a7] animate-spin mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        Generating your Identity Insight Report
      </h2>
      <p className="text-slate-500 text-sm mb-1">
        Analyzing your diary entries for patterns and insights...
      </p>
      {charCount > 0 && (
        <p className="text-xs text-slate-400 mt-3 tabular-nums">
          {charCount.toLocaleString()} characters written
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1">This takes about 30–60 seconds</p>
    </div>
  )
}
