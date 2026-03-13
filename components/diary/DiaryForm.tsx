'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONS } from '@/lib/questions'
import QuestionBlock from './QuestionBlock'
import Button from '@/components/ui/Button'

interface DiaryEntry {
  q1: string; q2: string; q3: string; q4: string; q5: string
  q6: string; q7: string; q8: string; q9: string; q10: string
}

interface DiaryFormProps {
  initialData: DiaryEntry | null
  entryDate: string
  userId: string
}

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

const empty: DiaryEntry = { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '' }

export default function DiaryForm({ initialData, entryDate, userId }: DiaryFormProps) {
  const [answers, setAnswers] = useState<DiaryEntry>(initialData ?? empty)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const answeredCount = Object.values(answers).filter(v => v.trim().length > 0).length

  const save = useCallback(async (data: DiaryEntry) => {
    setStatus('saving')
    const { error } = await supabase.from('diary_entries').upsert(
      { user_id: userId, entry_date: entryDate, ...data },
      { onConflict: 'user_id,entry_date' }
    )
    if (error) {
      setStatus('error')
    } else {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [supabase, userId, entryDate])

  function handleChange(key: keyof DiaryEntry, value: string) {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    setStatus('unsaved')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(updated), 2000)
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed — try again',
  }

  const statusColor: Record<SaveStatus, string> = {
    idle: 'text-slate-400',
    unsaved: 'text-slate-400',
    saving: 'text-[#0079a7]',
    saved: 'text-green-600',
    error: 'text-red-500',
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{answeredCount} of {QUESTIONS.length} questions answered</p>
        <span className={`text-xs ${statusColor[status]}`}>{statusLabel[status]}</span>
      </div>

      {QUESTIONS.map((q, i) => (
        <QuestionBlock
          key={q.id}
          questionNumber={i + 1}
          label={q.label}
          prompt={q.prompt}
          hints={q.hints}
          value={answers[q.id as keyof DiaryEntry]}
          onChange={val => handleChange(q.id as keyof DiaryEntry, val)}
        />
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className={`text-xs ${statusColor[status]}`}>{statusLabel[status]}</span>
        <Button onClick={() => save(answers)} loading={status === 'saving'}>
          Save Entry
        </Button>
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-400 leading-relaxed">
          The purpose of this diary is not perfection. It is awareness.<br />
          Over time, patterns will emerge. Those patterns reveal who you are, how you live, and what truly matters.<br />
          <span className="italic">When you can see clearly, you can move forward with intention.</span>
        </p>
      </div>
    </div>
  )
}
