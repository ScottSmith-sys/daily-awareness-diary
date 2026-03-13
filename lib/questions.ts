export interface Question {
  id: string
  label: string
  prompt: string
  hints?: string[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    label: 'Retrospection',
    prompt: 'What stood out about yesterday?',
    hints: [
      'Where did you feel:',
      '• Proud  • Energized  • Frustrated  • Disappointed',
      'What might that reveal about what matters most to you?',
    ],
  },
  {
    id: 'q2',
    label: 'Prospection',
    prompt: 'What will you move forward today?',
    hints: [
      'If today goes well, what will you create, improve, or advance?',
      'What would make today feel meaningful when you look back tonight?',
    ],
  },
  {
    id: 'q3',
    label: 'How Do I Want to Feel Today?',
    prompt: 'What emotional state do you want to carry into today?',
    hints: [
      'How will you protect that feeling when life gets busy or challenging?',
    ],
  },
  {
    id: 'q4',
    label: 'Who Am I Praying or Meditating For?',
    prompt: 'Who comes to mind today?',
    hints: ['Why are they on your mind?'],
  },
  {
    id: 'q5',
    label: 'What Am I Praying or Meditating For?',
    prompt: 'What outcome, guidance, strength, or clarity are you asking for today?',
  },
  {
    id: 'q6',
    label: 'Who Do I Want to Connect With?',
    prompt: 'Who would make today better if you reached out?',
    hints: ['Why does this relationship matter to you?'],
  },
  {
    id: 'q7',
    label: 'Pre-Planned Responses',
    prompt: 'What situations or encounters might test you today?',
    hints: ['How do you want the best version of yourself to respond?'],
  },
  {
    id: 'q8',
    label: 'Conclusion — Current Mindset',
    prompt: 'Right now your mindset feels:',
    hints: [
      '• Calm  • Focused  • Pressured  • Distracted  • Hopeful  • Uncertain',
      'Why?',
    ],
  },
  {
    id: 'q9',
    label: 'Personal Affirmation',
    prompt: 'What truth do you need to remind yourself of today?',
    hints: ['Write one sentence beginning with: "I am…"'],
  },
  {
    id: 'q10',
    label: 'Hidden Signal',
    prompt: 'What did you avoid yesterday?',
    hints: [
      'Or',
      'What thought, concern, or idea kept returning to your mind?',
    ],
  },
]
