import { resolveMessages, type LocaleMessages } from './resolveMessages.ts'
import type { Locale } from './locale.ts'

/** Anything that can report the current locale when asked — satisfied by `I18nStore`. */
export interface LocaleSource {
  readonly locale: Locale
}

export type LocaleListener = (locale: Locale) => void

export interface I18nStore extends LocaleSource {
  setLocale(locale: Locale): void
  /** Called after every locale change (not on subscribe). Returns an unsubscribe function. */
  subscribe(listener: LocaleListener): () => void
  /** `resolveMessages` against the current locale. */
  resolve<T extends LocaleMessages>(
    dictionaries: Record<string, T>,
    overrides?: Partial<T>,
  ): T
}

/** Holds the app's current locale and notifies subscribers when it changes. */
export function createI18nStore(initialLocale: Locale = 'en'): I18nStore {
  let locale = initialLocale
  const listeners = new Set<LocaleListener>()

  return {
    get locale() {
      return locale
    },

    setLocale(next) {
      if (next === locale) return
      locale = next
      // Snapshot: listeners added during this notification wait for the next one.
      for (const listener of Array.from(listeners)) listener(locale)
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    resolve(dictionaries, overrides) {
      return resolveMessages(locale, dictionaries, overrides)
    },
  }
}
