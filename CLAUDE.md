# Daily Awareness Diary — Project Context

## What This App Is

A daily journaling app built with Next.js 16, Supabase, and Tailwind CSS v4. Users answer 10 structured questions each day. Over time, their entries are analyzed by Claude to generate a 14-section "Identity Insight Report" that reveals patterns, values, beliefs, and life direction.

**Live URL:** https://daily-awareness-diary.vercel.app
**GitHub:** https://github.com/ScottSmith-sys/daily-awareness-diary

---

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Auth + DB:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling:** Tailwind CSS v4
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-20250514`
- **Email:** Resend (`resend`) — optional, only fires if `RESEND_API_KEY` is set
- **PDF Export:** jsPDF (`jspdf`)
- **Deployment:** Vercel (via `npx vercel --prod`)

---

## Environment Variables

Set in Vercel dashboard and locally in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=           # optional — email is skipped if not set
RESEND_FROM_EMAIL=        # optional — defaults to onboarding@resend.dev
```

---

## Database Schema (Supabase)

### `diary_entries`
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID | FK → auth.users |
| entry_date | DATE | YYYY-MM-DD |
| q1–q10 | TEXT | One column per question (q10 added later — run migration below) |

Unique constraint on `(user_id, entry_date)`.

### `insight_reports`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, gen_random_uuid() |
| user_id | UUID | FK → auth.users, ON DELETE CASCADE |
| report_text | TEXT | Full markdown report from Claude |
| entry_count | INTEGER | Number of entries analyzed |
| created_at | TIMESTAMPTZ | Default now() |

RLS enabled on both tables. Policy: users can only see/modify their own rows.

**Migration needed if starting fresh or if q10 is missing:**
```sql
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS q10 TEXT;
```

---

## Key Decisions Made

- **`force-dynamic`** on the dashboard page — prevents Next.js 15 router cache from serving stale RSC payloads when `searchParams` change.
- **`<Link>` not `router.push`** in DateSelector — `router.push` from client components is affected by the Next.js 15 client-side router cache and doesn't reliably re-run server components. `<Link>` does.
- **`key={selectedDate}`** on DiaryForm — forces React to fully remount the component when the selected date changes, resetting state correctly.
- **`normalize()` in DiaryForm** — Supabase returns `null` (not `""`) for empty columns. All fields are coerced to strings before initializing state to prevent `.trim()` crashes.
- **Streaming SSE for report generation** — Claude report generation takes 30–60 seconds. The API route streams chunks to the client so the user sees live progress rather than a blank wait.
- **Reports saved to DB** — after generation, the full report text + entry count is saved to `insight_reports` before the `done` SSE event. The client redirects to `/reports/[id]`.
- **PDF export is purely client-side** — jsPDF runs in the browser. No server involvement.
- **Streak counts from yesterday if today has no entry** — the streak stays "alive" during the day before the user has written today's entry.

---

## App Structure

```
app/
  (auth)/login, /signup        — public auth pages
  (app)/                       — protected routes (auth checked in layout)
    dashboard/                 — today's entry + date selector + streak + report banner
    entries/                   — past entries list + calendar view
    entries/[date]/            — single entry read-only view
    reports/                   — list of all saved Insight Reports
    reports/[id]/              — single report view + export buttons
    insight-report/            — streaming generation page (redirects to /reports/[id])
    account/                   — password change + sign out
  api/insight-report/          — POST: generate report, save to DB, send email, stream SSE
  auth/callback/               — Supabase OAuth callback

components/
  diary/
    DiaryForm.tsx              — 10-question form with auto-save (2s debounce)
    QuestionBlock.tsx          — single question with hints rendering
    DateSelector.tsx           — 7-day date picker (server-rendered via Link)
    StreakTracker.tsx           — streak stats + 30-day activity grid + achievement banners
    InsightReport.tsx          — 14-section report renderer (parses markdown)
    ReportExport.tsx           — PDF + text export buttons (client-side jsPDF)
  layout/NavBar.tsx            — Today / Past Entries / Reports / Account / Sign Out
  ui/Button, Card, Input, Textarea

lib/
  questions.ts                 — 10 questions with labels, prompts, and hints[]
  insight-prompt.ts            — full system prompt for Claude
  utils.ts                     — date helpers + streak calculation functions
  supabase/client.ts, server.ts
```

---

## The 10 Diary Questions

1. Retrospection — What stood out about yesterday?
2. Prospection — What will you move forward today?
3. How Do I Want to Feel Today?
4. Who Am I Praying or Meditating For?
5. What Am I Praying or Meditating For?
6. Who Do I Want to Connect With?
7. Pre-Planned Responses
8. Conclusion — Current Mindset
9. Personal Affirmation
10. Hidden Signal

Each question has `hints[]` — sub-questions and bullet options that render below the main prompt in muted text.

---

## Identity Insight Report

- **14 sections:** Opening Reflection → Core Beliefs → True Values → Behavioral Patterns → WHO I AM → Truths I Hold → Non-Negotiables → Strengths → Passions → Current Legacy → Anticipation Engine → Exploring the Possibilities → Natural Forward Motion → My Next Season
- **Model:** `claude-sonnet-4-20250514`
- **Max tokens:** 8000
- **System prompt:** `lib/insight-prompt.ts`
- **Streaming:** SSE chunks → client accumulates → redirects to `/reports/[id]` on `done`
- **Email:** sent via Resend after full report collected (optional)

---

## Dashboard Features

- **7-day date selector** — defaults to today, shows filled/empty dot per date, loads correct entry on click
- **Streak tracker** — current streak 🔥, best streak, total entries, 30-day activity grid (10×3 squares)
- **Achievement banners** — amber gradient banner at 7, 14, and 21-day streaks (only on the milestone day when today has an entry)
- **Insight Report banner** — always visible; greyed/locked below threshold, active above

---

## ⚠️ Current Testing State (needs reverting before launch)

```typescript
// app/(app)/dashboard/page.tsx
const UNLOCK_AT = 3   // ← change back to 14 for production
```

```typescript
// app/api/insight-report/route.ts
if (!entries || entries.length < 3)   // ← change back to 14 for production
```

---

## To-Do / Not Yet Built

- [ ] **Restore production thresholds** — change `UNLOCK_AT` and API minimum back to 14
- [ ] **Resend email setup** — needs a verified sending domain in Resend dashboard; currently falls back to `onboarding@resend.dev` which only works for the account owner's email
- [ ] **Git author config** — `git config --global user.name` and `user.email` not set; commits show `scottsmith@Mac-Studio.local`
- [ ] **Landing page** — `app/page.tsx` just redirects to dashboard; could be a proper marketing/intro page
- [ ] **Mobile nav** — nav bar has 5 items; on small screens it could get crowded
- [ ] **Entry deletion** — no way to delete an entry once created
- [ ] **Account deletion** — no way to delete account / all data
- [ ] **Report regeneration** — currently always generates fresh; could offer "regenerate" from the report detail page
- [ ] **Push notifications / reminders** — daily reminder to write
- [ ] **Onboarding flow** — new users land on the diary form with no context; an intro screen would help

---

## Deployment

```bash
# Push to GitHub (triggers nothing automatically — Vercel is not connected to GitHub auto-deploy)
git push

# Deploy to production manually
npx vercel --prod

# Add/update an env var
npx vercel env add VAR_NAME production <<< "value"
```

> Note: Vercel was set up via CLI (`npx vercel`), not through the Vercel GitHub integration. Auto-deploys on push are **not** enabled — every deploy is manual via `npx vercel --prod`.
