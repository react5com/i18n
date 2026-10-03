import type { Locale } from './locale.ts'
import { isValidLocaleTag, isValidTimeZone } from './negotiate.ts'

/**
 * The locale for numbers and dates: the chosen regional format, else the UI language (also when
 * the regional format is not a well-formed locale tag).
 */
export function formatLocale(uiLocale: Locale, regionalFormat?: string): Locale {
  return regionalFormat && isValidLocaleTag(regionalFormat) ? regionalFormat : uiLocale
}

/** Hours with the locale's number and (narrow) unit formatting, e.g. `1.5h` or `1,5 Std.`. */
export function formatHours(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'hour',
    unitDisplay: 'narrow',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Locale-aware, numeric-aware string comparison (for sort callbacks). */
export function compareText(locale: Locale): (a: string, b: string) => number {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  return (a, b) => collator.compare(a, b)
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function toDate(value: Date | string): Date | undefined {
  const date = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** A real calendar date for `YYYY-MM-DD` (rejects `2026-13-45` and `2026-02-30`), else undefined. */
function parseDateOnly(value: string): Date | undefined {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date
}

/**
 * Medium date + short time in the given locale and time zone (default: system, also when
 * `timeZone` is unknown). Returns an empty string for an invalid date.
 */
export function formatDateTime(value: Date | string, locale: Locale, timeZone?: string): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timeZone && isValidTimeZone(timeZone) ? timeZone : undefined,
  }).format(date)
}

/**
 * Medium date in the given locale; date-only strings (`YYYY-MM-DD`) are not shifted by the time
 * zone. `Date` objects and other strings are instants and are shown in `timeZone` (default:
 * system, also when `timeZone` is unknown). Returns an empty string for an invalid date.
 */
export function formatDate(value: Date | string, locale: Locale, timeZone?: string): string {
  const dateOnly = typeof value === 'string' ? parseDateOnly(value) : undefined
  if (typeof value === 'string' && DATE_ONLY.test(value) && !dateOnly) return ''
  if (dateOnly) return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(dateOnly)
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: timeZone && isValidTimeZone(timeZone) ? timeZone : undefined,
  }).format(date)
}
