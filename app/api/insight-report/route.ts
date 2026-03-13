import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { QUESTIONS } from '@/lib/questions'
import { INSIGHT_SYSTEM_PROMPT } from '@/lib/insight-prompt'

export const maxDuration = 300

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: true })

  if (!entries || entries.length < 21) {
    return Response.json(
      { error: 'You need at least 21 diary entries to generate a report.' },
      { status: 400 }
    )
  }

  const formattedEntries = entries
    .map(entry => {
      const lines = QUESTIONS.map(q => {
        const answer = (entry as Record<string, string>)[q.id] || '(no response)'
        return `${q.label}: ${q.prompt}\n${answer}`
      }).join('\n\n')
      return `--- Entry: ${entry.entry_date} ---\n${lines}`
    })
    .join('\n\n===\n\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullReport = ''

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: INSIGHT_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: formattedEntries }],
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullReport += event.delta.text
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            )
          }
        }

        // Send email after full report is generated
        let emailSent = false
        if (process.env.RESEND_API_KEY && user.email) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY)
            const fromEmail =
              process.env.RESEND_FROM_EMAIL ||
              'Daily Awareness Diary <onboarding@resend.dev>'

            const emailHtml = fullReport
              .split('\n')
              .map(line => {
                if (line.startsWith('## '))
                  return `<h2 style="color:#0079a7;margin-top:32px;margin-bottom:8px;font-family:sans-serif">${line.slice(3)}</h2>`
                if (line.startsWith('### '))
                  return `<h3 style="color:#334155;margin-top:20px;margin-bottom:6px;font-family:sans-serif">${line.slice(4)}</h3>`
                if (line.startsWith('• ') || line.startsWith('- '))
                  return `<li style="margin:4px 0;font-family:sans-serif;color:#1e293b">${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`
                if (!line.trim()) return '<br>'
                return `<p style="margin:8px 0;font-family:sans-serif;color:#1e293b;line-height:1.6">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
              })
              .join('\n')

            await resend.emails.send({
              from: fromEmail,
              to: user.email,
              subject: 'Your Identity Insight Report — Daily Awareness Diary',
              html: `
                <div style="max-width:700px;margin:0 auto;padding:32px 24px;background:#ffffff">
                  <div style="border-bottom:3px solid #0079a7;padding-bottom:24px;margin-bottom:24px">
                    <h1 style="color:#0079a7;margin:0 0 8px;font-family:sans-serif">Your Identity Insight Report</h1>
                    <p style="color:#64748b;margin:0;font-family:sans-serif">Generated from your Daily Awareness Diary — ${entries.length} entries analyzed</p>
                  </div>
                  ${emailHtml}
                </div>
              `,
            })
            emailSent = true
          } catch (emailError) {
            console.error('Failed to send email:', emailError)
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, emailSent, entryCount: entries.length })}\n\n`
          )
        )
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Failed to generate report. Please try again.' })}\n\n`
          )
        )
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
