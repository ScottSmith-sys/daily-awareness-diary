'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'

interface Section {
  number: string
  title: string
  content: string
}

function parseSectionsForExport(report: string): Section[] {
  return report
    .split(/\n(?=## )/)
    .filter(p => p.startsWith('## '))
    .map(part => {
      const nl = part.indexOf('\n')
      const header = nl === -1 ? part : part.slice(0, nl)
      const content = nl === -1 ? '' : part.slice(nl + 1).trim()
      const titleRaw = header.slice(3).trim()
      const m = titleRaw.match(/^(\d+)\.\s+(.+)$/)
      return { number: m ? m[1] : '', title: m ? m[2] : titleRaw, content }
    })
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .trim()
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function buildPDF(report: string, createdAt: string, entryCount: number): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 22
  const CONTENT_W = PAGE_W - MARGIN * 2
  const primary = hexToRgb('#0079a7')
  const dark = hexToRgb('#1e293b')
  const mid = hexToRgb('#475569')
  const light = hexToRgb('#94a3b8')

  let y = MARGIN

  const addPage = () => {
    doc.addPage()
    y = MARGIN
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(light.r, light.g, light.b)
    doc.text('Identity Insight Report  •  Daily Awareness Diary', MARGIN, PAGE_H - 12)
    doc.text(String(doc.getNumberOfPages()), PAGE_W - MARGIN, PAGE_H - 12, { align: 'right' })
    y = MARGIN
  }

  const checkPageBreak = (needed: number) => {
    if (y + needed > PAGE_H - 20) addPage()
  }

  // ── Cover header ──────────────────────────────────────────────
  doc.setFillColor(primary.r, primary.g, primary.b)
  doc.rect(0, 0, PAGE_W, 48, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Identity Insight Report', MARGIN, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Daily Awareness Diary', MARGIN, 31)

  doc.setFontSize(9)
  doc.setTextColor(200, 230, 240)
  doc.text(`Generated ${createdAt}  •  ${entryCount} entries analyzed`, MARGIN, 40)

  y = 60

  // ── Footer on page 1 ─────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(light.r, light.g, light.b)
  doc.text('Identity Insight Report  •  Daily Awareness Diary', MARGIN, PAGE_H - 12)
  doc.text('1', PAGE_W - MARGIN, PAGE_H - 12, { align: 'right' })

  // ── Sections ─────────────────────────────────────────────────
  const sections = parseSectionsForExport(report)

  for (const section of sections) {
    checkPageBreak(20)

    // Section number badge + title
    if (section.number) {
      doc.setFillColor(primary.r, primary.g, primary.b)
      doc.circle(MARGIN + 4, y + 1, 4, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(section.number, MARGIN + 4, y + 1 + 2.5, { align: 'center' })
    }

    doc.setTextColor(dark.r, dark.g, dark.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(section.title, MARGIN + 11, y + 4)
    y += 12

    // Thin rule under heading
    doc.setDrawColor(primary.r, primary.g, primary.b)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
    y += 5

    // Body content — process line by line
    const lines = section.content.split('\n')
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) { y += 2; continue }

      if (line.startsWith('### ')) {
        checkPageBreak(8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(primary.r, primary.g, primary.b)
        doc.text(line.slice(4).toUpperCase(), MARGIN, y)
        y += 6
        continue
      }

      const isBullet = line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')
      const indent = isBullet ? MARGIN + 5 : MARGIN
      const textWidth = CONTENT_W - (isBullet ? 5 : 0)
      const cleanLine = stripMarkdown(isBullet ? line.slice(2) : line)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(mid.r, mid.g, mid.b)

      if (isBullet) {
        doc.setFillColor(primary.r, primary.g, primary.b)
        doc.circle(MARGIN + 1.5, y - 1, 1, 'F')
      }

      const wrapped = doc.splitTextToSize(cleanLine, textWidth)
      checkPageBreak(wrapped.length * 5 + 2)
      doc.text(wrapped, indent, y)
      y += wrapped.length * 5 + 1
    }

    y += 8
  }

  return doc
}

interface ReportExportProps {
  report: string
  createdAt: string
  entryCount: number
}

export default function ReportExport({ report, createdAt, entryCount }: ReportExportProps) {
  const [pdfLoading, setPdfLoading] = useState(false)

  function exportText() {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `identity-insight-report-${createdAt}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    setPdfLoading(true)
    try {
      const doc = buildPDF(report, createdAt, entryCount)
      doc.save(`identity-insight-report-${createdAt}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportPDF}
        disabled={pdfLoading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0079a7] px-3 py-1.5 text-sm font-medium text-[#0079a7] hover:bg-[#e6f4f9] transition-colors disabled:opacity-50"
      >
        {pdfLoading ? (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        )}
        Export PDF
      </button>
      <button
        onClick={exportText}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Text
      </button>
    </div>
  )
}
