import { languageSubtag, type Locale } from './locale.ts'

/** A flat message group; nested groups are resolved per top-level key. */
export type LocaleMessages = object

export interface ResolveMessagesOptions {
  /** Report messages missing from the selected language with `console.warn`. Default `false`. */
  warnOnMissing?: boolean
}

/**
 * Picks the message group for `locale` from `dictionaries` (keyed by language), falling back
 * per message to the `fallback` language (default `'en'`) and applying `overrides` last.
 * Pass `{ warnOnMissing: true }` (e.g. `import.meta.env.DEV` in the host app) to log missing
 * messages.
 *
 * Overrides are checked against the dictionary keys, so a typo is a type error. To pass through
 * extra keys the dictionaries do not define (e.g. the caller's own messages), name them
 * explicitly: `resolveMessages<Dict, Extra>(…)`. They are kept as-is and typed `T & O`.
 */
export function resolveMessages<T extends LocaleMessages, O extends object = object>(
  locale: Locale | undefined,
  dictionaries: Record<string, T>,
  overrides?: Partial<T> & NoInfer<O>,
  fallback = 'en',
  options: ResolveMessagesOptions = {},
): T & O {
  const base = dictionaries[fallback]
  if (!base) throw new Error(`[i18n] Missing fallback dictionary: ${fallback}`)
  const language = locale && languageSubtag(locale)
  const selected = language && language in dictionaries ? dictionaries[language] : undefined
  if (language && !selected && options.warnOnMissing)
    console.warn(`[i18n] Missing dictionary: ${language}`)
  const result = { ...base }
  for (const key of Object.keys(base) as (keyof T)[]) {
    const value = selected?.[key]
    if (value !== undefined && value !== null) result[key] = value
    else if (selected && options.warnOnMissing)
      console.warn(`[i18n] Missing message: ${language}.${String(key)}`)
    const override = overrides?.[key]
    if (override !== undefined && override !== null) result[key] = override as T[keyof T]
  }
  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (key === '__proto__' || Object.hasOwn(base, key) || value === undefined || value === null) continue
    Object.defineProperty(result, key, { value, enumerable: true, writable: true, configurable: true })
  }
  return result as T & O
}
