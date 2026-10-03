import { describe, expect, it } from 'vitest'
import {
  compareText,
  formatDate,
  formatDateTime,
  formatHours,
  formatLocale,
  isValidLocaleTag,
  isValidTimeZone,
  negotiateLocale,
} from '../src/index.ts'

describe('formatHours', () => {
  it('uses the locale number format', () => {
    expect(formatHours(1.5, 'en')).toBe('1.5h')
    expect(formatHours(1.5, 'de')).toContain('1,5')
  })
})

describe('compareText', () => {
  it('sorts by locale rules and numerically', () => {
    expect(['z', 'ä', 'a'].sort(compareText('sv'))).toEqual(['a', 'z', 'ä'])
    expect(['task 10', 'task 2'].sort(compareText('en'))).toEqual(['task 2', 'task 10'])
  })
})

describe('formatDate', () => {
  it('does not shift date-only values', () => {
    expect(formatDate('2026-10-02', 'en')).toBe('Oct 2, 2026')
  })

  it('applies the time zone to instants', () => {
    expect(formatDate('2026-10-02T23:30:00Z', 'en', 'Asia/Tokyo')).toBe('Oct 3, 2026')
  })
})

describe('invalid input', () => {
  it('formats nothing for invalid dates', () => {
    expect(formatDate('garbage', 'en')).toBe('')
    expect(formatDate('2026-13-45', 'en')).toBe('')
    expect(formatDate('2026-02-30', 'en')).toBe('')
    expect(formatDate(new Date(NaN), 'en')).toBe('')
    expect(formatDateTime('garbage', 'en')).toBe('')
  })

  it('ignores an unknown time zone', () => {
    expect(formatDate('2026-10-02T12:00:00Z', 'en', 'Mars/Base')).toMatch(/Oct [23], 2026/)
    expect(formatDateTime(new Date('2026-10-02T12:00:00Z'), 'en', 'Mars/Base')).toContain('2026')
  })
})

describe('formatDateTime', () => {
  it('formats date and time in the time zone', () => {
    expect(formatDateTime(new Date('2026-10-02T12:00:00Z'), 'en', 'UTC')).toContain('Oct 2, 2026')
  })
})

describe('formatLocale', () => {
  it('prefers the regional format over the UI language', () => {
    expect(formatLocale('en', 'de-DE')).toBe('de-DE')
    expect(formatLocale('en')).toBe('en')
    expect(formatLocale('en', '')).toBe('en')
  })

  it('ignores malformed regional formats', () => {
    expect(formatLocale('en', 'en_US')).toBe('en')
    expect(formatLocale('en', ' ')).toBe('en')
  })
})

describe('negotiateLocale', () => {
  const supported = ['en', 'fr', 'de'] as const

  it('picks the first requested language that is supported', () => {
    expect(negotiateLocale(['sv-SE', 'de_AT', 'fr'], supported)).toBe('de')
  })

  it('falls back to the given or first supported language', () => {
    expect(negotiateLocale(['sv'], supported)).toBe('en')
    expect(negotiateLocale([undefined, null], supported, 'fr')).toBe('fr')
  })

  it('throws without any supported language or fallback', () => {
    expect(() => negotiateLocale(['en'], [])).toThrow(RangeError)
    expect(negotiateLocale(['en'], [] as string[], 'fr')).toBe('fr')
  })
})

describe('validators', () => {
  it('checks time zones', () => {
    expect(isValidTimeZone('Europe/Berlin')).toBe(true)
    expect(isValidTimeZone('Mars/Base')).toBe(false)
  })

  it('checks locale tags', () => {
    expect(isValidLocaleTag('de-DE')).toBe(true)
    expect(isValidLocaleTag('not a tag')).toBe(false)
  })
})
