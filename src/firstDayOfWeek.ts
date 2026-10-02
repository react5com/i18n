import type { Locale } from './locale.ts'

/**
 * First day of the week (0 = Sunday … 6 = Saturday). Uses Intl.Locale week data where
 * available, with a stable Sunday-first English default. `explicit` overrides the locale.
 */
export function firstDayOfWeek(locale?: Locale, explicit?: number): number {
  if (explicit !== undefined) return ((Math.trunc(explicit) % 7) + 7) % 7
  if (!locale) return 0
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const firstDay = info.weekInfo?.firstDay ?? info.getWeekInfo?.().firstDay
    if (firstDay !== undefined) return firstDay % 7
  } catch {
    /* Invalid tags fall back to English. */
  }
  const [language, region] = locale
    .replace('_', '-')
    .split('-')
    .map((part) => part.toLowerCase())
  if (language === 'ja' || (language === 'zh' && ['tw', 'hk', 'mo'].includes(region ?? '')))
    return 0
  if (language === 'en' && (!region || ['us', 'ca', 'ph'].includes(region))) return 0
  return 1
}
