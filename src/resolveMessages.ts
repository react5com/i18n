import { languageSubtag, type Locale } from './locale.ts'

/** A flat message group; nested groups are resolved per top-level key. */
export type LocaleMessages = object

/**
 * Picks the message group for `locale` from `dictionaries` (keyed by language), falling back
 * per message to the `fallback` language (default `'en'`) and applying `overrides` last.
 * Missing messages are reported with `console.warn` when the host app runs in dev mode.
 */
export function resolveMessages<T extends LocaleMessages>(
  locale: Locale | undefined,
  dictionaries: Record<string, T>,
  overrides?: Partial<T>,
  fallback = 'en',
): T {
  const base = dictionaries[fallback]
  if (!base) throw new Error(`[i18n] Missing fallback dictionary: ${fallback}`)
  const language = locale && languageSubtag(locale)
  const selected = language && language in dictionaries ? dictionaries[language] : undefined
  const result = { ...base }
  for (const key of Object.keys(base) as (keyof T)[]) {
    const value = selected?.[key]
    if (value !== undefined && value !== null) result[key] = value
    else if (selected && import.meta.env?.DEV)
      console.warn(`[i18n] Missing message: ${language}.${String(key)}`)
    const override = overrides?.[key]
    if (override !== undefined && override !== null) result[key] = override as T[keyof T]
  }
  return result
}
