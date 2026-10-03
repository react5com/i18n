import { describe, expect, it, vi } from 'vitest'
import {
  createI18nStore,
  firstDayOfWeek,
  formatMessage,
  languageOf,
  resolveMessages,
} from '../src/index.ts'

const SUPPORTED = ['en', 'fr', 'de'] as const

describe('languageOf', () => {
  it('maps regional and underscored tags to a supported language', () => {
    expect(languageOf('fr-CA', SUPPORTED)).toBe('fr')
    expect(languageOf(' DE_at ', SUPPORTED)).toBe('de')
  })
  it('falls back for unknown or missing locales', () => {
    expect(languageOf('ja', SUPPORTED)).toBe('en')
    expect(languageOf(undefined, SUPPORTED, 'de')).toBe('de')
  })
})

describe('formatMessage', () => {
  it('uses locale plural rules, nested selects and ordinals', () => {
    const message = '{count, plural, one {# task} other {# tasks}}'
    expect(formatMessage(message, { count: 1 }, 'en')).toBe('1 task')
    expect(formatMessage(message, { count: 0 }, 'fr')).toBe('0 task')
    expect(formatMessage(message, { count: 1 }, 'ja')).toBe('1 tasks')
    expect(
      formatMessage('{n, plural, =0 {Nobody} other {{name} and # others}}', { n: 2, name: 'Ada' }),
    ).toBe('Ada and 2 others')
    expect(
      formatMessage('{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}', { n: 22 }),
    ).toBe('22nd')
  })
  it('rejects missing values and malformed ICU instead of hiding mistakes', () => {
    expect(() => formatMessage('Hello {name}', {})).toThrow()
    expect(() => formatMessage('{n, plural, one {one}}', { n: 1 })).toThrow()
    expect(formatMessage('Hello {name}', { name: '' })).toBe('Hello ')
  })
})

describe('resolveMessages', () => {
  const dictionaries = {
    en: { title: 'Title', close: 'Close' },
    fr: { title: 'Titre', close: undefined as unknown as string },
  }
  it('falls back per message and ignores undefined overrides', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(
      resolveMessages('fr-CA', dictionaries, { title: undefined }, 'en', { warnOnMissing: true }),
    ).toEqual({
      title: 'Titre',
      close: 'Close',
    })
    expect(warn).toHaveBeenCalledWith('[i18n] Missing message: fr.close')
    expect(resolveMessages('fr', dictionaries, { close: 'Fermer' }).close).toBe('Fermer')
    warn.mockRestore()
  })
  it('uses the fallback dictionary for unknown locales and honours a custom fallback', () => {
    expect(resolveMessages('xx', dictionaries).title).toBe('Title')
    expect(resolveMessages(undefined, dictionaries, undefined, 'fr').title).toBe('Titre')
    expect(() => resolveMessages('en', { fr: dictionaries.fr })).toThrow(/fallback/)
  })
})

describe('createI18nStore', () => {
  it('defaults to English and resolves dictionaries against the current locale', () => {
    const i18n = createI18nStore()
    expect(i18n.locale).toBe('en')
    i18n.setLocale('fr-CA')
    const dictionaries = { en: { close: 'Close' }, fr: { close: 'Fermer' } }
    expect(i18n.resolve(dictionaries).close).toBe('Fermer')
    expect(i18n.resolve(dictionaries, { close: 'X' }).close).toBe('X')
  })
  it('uses the configured fallback language', () => {
    const i18n = createI18nStore('de', { fallback: 'fr' })
    const dictionaries = { en: { close: 'Close' }, fr: { close: 'Fermer' } }
    expect(i18n.resolve(dictionaries).close).toBe('Fermer')
  })
  it('warns once when the language has no dictionary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const dictionaries = { en: { a: 'A', b: 'B' }, fr: { a: 'A', b: 'B' } }
    resolveMessages('de', dictionaries, undefined, 'en', { warnOnMissing: true })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith('[i18n] Missing dictionary: de')
    warn.mockRestore()
  })
  it('notifies subscribers on change only, until unsubscribed', () => {
    const i18n = createI18nStore('en')
    const listener = vi.fn()
    const unsubscribe = i18n.subscribe(listener)
    i18n.setLocale('en')
    expect(listener).not.toHaveBeenCalled()
    i18n.setLocale('de')
    expect(listener).toHaveBeenCalledExactlyOnceWith('de')
    unsubscribe()
    i18n.setLocale('ja')
    expect(listener).toHaveBeenCalledOnce()
  })
})

describe('firstDayOfWeek', () => {
  it('defaults to Sunday, follows the locale and honours an explicit day', () => {
    expect(firstDayOfWeek(undefined)).toBe(0)
    expect(firstDayOfWeek('fr-FR')).toBe(1)
    expect(firstDayOfWeek('en-US')).toBe(0)
    expect(firstDayOfWeek('fr-FR', 0)).toBe(0)
    expect(firstDayOfWeek('en', -1)).toBe(6)
  })
})
