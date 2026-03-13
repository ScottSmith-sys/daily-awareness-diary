'use client'

import React from 'react'

interface Section {
  number: string
  title: string
  content: string
}

function parseSections(report: string): Section[] {
  const parts = report.split(/\n(?=## )/)
  return parts
    .filter(part => part.startsWith('## '))
    .map(part => {
      const firstNewline = part.indexOf('\n')
      const header = firstNewline === -1 ? part : part.slice(0, firstNewline)
      const content = firstNewline === -1 ? '' : part.slice(firstNewline + 1).trim()
      const titleRaw = header.slice(3).trim()
      const match = titleRaw.match(/^(\d+)\.\s+(.+)$/)
      return {
        number: match ? match[1] : '',
        title: match ? match[2] : titleRaw,
        content,
      }
    })
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let bulletItems: string[] = []
  let numberedItems: string[] = []
  let keyIndex = 0

  const flushBullets = () => {
    if (bulletItems.length) {
      elements.push(
        <ul key={keyIndex++} className="my-3 space-y-1.5 pl-1">
          {bulletItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-slate-700 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0079a7]" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      bulletItems = []
    }
  }

  const flushNumbered = () => {
    if (numberedItems.length) {
      elements.push(
        <ol key={keyIndex++} className="my-3 space-y-1.5 pl-1">
          {numberedItems.map((item, i) => (
            <li key={i} className="flex gap-3 text-slate-700 leading-relaxed">
              <span className="mt-0.5 shrink-0 text-xs font-bold text-[#0079a7] w-4">{i + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      numberedItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushBullets()
      flushNumbered()
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushBullets()
      flushNumbered()
      elements.push(
        <h4 key={keyIndex++} className="mt-5 mb-2 text-xs font-semibold uppercase tracking-widest text-[#0079a7]">
          {trimmed.slice(4)}
        </h4>
      )
      continue
    }

    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushNumbered()
      bulletItems.push(trimmed.slice(2))
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushBullets()
      numberedItems.push(trimmed.replace(/^\d+\.\s+/, ''))
      continue
    }

    // Check if line looks like a bold heading (standalone **text**)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      flushBullets()
      flushNumbered()
      elements.push(
        <p key={keyIndex++} className="mt-4 mb-1 font-semibold text-slate-800">
          {trimmed.slice(2, -2)}
        </p>
      )
      continue
    }

    flushBullets()
    flushNumbered()
    elements.push(
      <p key={keyIndex++} className="my-2 text-slate-700 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    )
  }

  flushBullets()
  flushNumbered()
  return elements
}

const SECTION_COLORS: Record<string, string> = {
  '1': 'from-blue-50 to-white border-blue-200',
  '2': 'from-indigo-50 to-white border-indigo-200',
  '3': 'from-violet-50 to-white border-violet-200',
  '4': 'from-purple-50 to-white border-purple-200',
  '5': 'from-sky-50 to-white border-sky-200',
  '6': 'from-teal-50 to-white border-teal-200',
  '7': 'from-cyan-50 to-white border-cyan-200',
  '8': 'from-emerald-50 to-white border-emerald-200',
  '9': 'from-green-50 to-white border-green-200',
  '10': 'from-lime-50 to-white border-lime-200',
  '11': 'from-amber-50 to-white border-amber-200',
  '12': 'from-orange-50 to-white border-orange-200',
  '13': 'from-rose-50 to-white border-rose-200',
  '14': 'from-pink-50 to-white border-pink-200',
}

function SectionCard({ section }: { section: Section }) {
  const colorClass = SECTION_COLORS[section.number] || 'from-slate-50 to-white border-slate-200'
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-6 shadow-sm`}>
      <div className="mb-4 flex items-center gap-3">
        {section.number && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0079a7] text-xs font-bold text-white">
            {section.number}
          </div>
        )}
        <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
      </div>
      <div className="text-sm">{renderContent(section.content)}</div>
    </div>
  )
}

interface InsightReportProps {
  report: string
  entryCount: number
  emailSent: boolean
}

export default function InsightReport({ report, entryCount, emailSent }: InsightReportProps) {
  const sections = parseSections(report)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0079a7] p-6 text-white">
        <h1 className="text-2xl font-bold">Your Identity Insight Report</h1>
        <p className="mt-1 text-sm text-blue-100">
          Generated from {entryCount} diary {entryCount === 1 ? 'entry' : 'entries'}
        </p>
        {emailSent && (
          <p className="mt-2 text-xs text-blue-200">
            ✓ A copy has been sent to your email
          </p>
        )}
      </div>

      {sections.length > 0 ? (
        sections.map((section, i) => (
          <SectionCard key={i} section={section} />
        ))
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{report}</pre>
        </div>
      )}
    </div>
  )
}
