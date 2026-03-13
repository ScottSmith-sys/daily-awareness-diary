'use client'

import Textarea from '@/components/ui/Textarea'

interface QuestionBlockProps {
  questionNumber: number
  label: string
  prompt: string
  hints?: string[]
  value: string
  onChange: (value: string) => void
}

export default function QuestionBlock({
  questionNumber,
  label,
  prompt,
  hints,
  value,
  onChange,
}: QuestionBlockProps) {
  return (
    <div className="space-y-2">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#0079a7]">
          {questionNumber}. {label}
        </span>
        <p className="text-sm font-medium text-slate-700 mt-1">{prompt}</p>
        {hints && hints.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {hints.map((hint, i) => (
              <p key={i} className={`text-xs leading-relaxed ${
                hint.startsWith('•')
                  ? 'text-slate-400 pl-1'
                  : hint === 'Or'
                    ? 'text-slate-400 italic'
                    : 'text-slate-500'
              }`}>
                {hint}
              </p>
            ))}
          </div>
        )}
      </div>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write your response here..."
      />
    </div>
  )
}
