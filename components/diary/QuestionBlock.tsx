'use client'

import Textarea from '@/components/ui/Textarea'

interface QuestionBlockProps {
  questionNumber: number
  label: string
  prompt: string
  value: string
  onChange: (value: string) => void
}

export default function QuestionBlock({
  questionNumber,
  label,
  prompt,
  value,
  onChange,
}: QuestionBlockProps) {
  return (
    <div className="space-y-2">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#0079a7]">
          {questionNumber}. {label}
        </span>
        <p className="text-sm text-slate-600 mt-0.5">{prompt}</p>
      </div>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write your response here..."
      />
    </div>
  )
}
