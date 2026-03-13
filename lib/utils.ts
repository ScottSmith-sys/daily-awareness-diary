export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA') // returns YYYY-MM-DD in local time
}

export function formatDisplayDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function offsetDate(today: string, daysAgo: number): string {
  const [y, m, d] = today.split('-').map(Number)
  const date = new Date(y, m - 1, d - daysAgo)
  return date.toLocaleDateString('en-CA')
}

export function calcCurrentStreak(dateSet: Set<string>, today: string): number {
  // If today has no entry, start counting from yesterday so streak stays alive
  const [y, m, d] = today.split('-').map(Number)
  let date = new Date(y, m - 1, d)
  if (!dateSet.has(today)) date.setDate(date.getDate() - 1)

  let streak = 0
  while (dateSet.has(date.toLocaleDateString('en-CA'))) {
    streak++
    date.setDate(date.getDate() - 1)
  }
  return streak
}

export function calcLongestStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort()
  let longest = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const [py, pm, pd] = sorted[i - 1].split('-').map(Number)
    const [cy, cm, cd] = sorted[i].split('-').map(Number)
    const diff =
      (new Date(cy, cm - 1, cd).getTime() - new Date(py, pm - 1, pd).getTime()) /
      86400000
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else if (diff > 1) {
      current = 1
    }
  }
  return longest
}

export function getLast30Activity(dateSet: Set<string>, today: string): boolean[] {
  return Array.from({ length: 30 }, (_, i) => dateSet.has(offsetDate(today, 29 - i)))
}
