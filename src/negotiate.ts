import { languageSubtag, type Locale } from './locale.ts'

/**
 * The first entry of `requested` (for example `navigator.languages`) whose language is in
 * `supported`, returned as that supported language; `fallback` (default: the first supported
 * language) when none match. Earlier requests win over later ones. Throws when `supported` is
 * empty and no `fallback` is given.
 */
export function negotiateLocale<L extends string>(
  requested: readonly (Locale | null | undefined)[],
  supported: readonly L[],
  fallback?: L,
): L {
  const defaultLanguage = fallback ?? supported[0]
  if (defaultLanguage === undefined) throw new RangeError('negotiateLocale: no supported languages')
  for (const locale of requested) {
    if (!locale) continue
    const language = languageSubtag(locale)
    if ((supported as readonly string[]).includes(language)) return language as L
  }
  return defaultLanguage
}

/** Whether `timeZone` is an IANA time zone this runtime knows. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

/** Whether `tag` is a single well-formed BCP 47 locale tag. */
export function isValidLocaleTag(tag: string): boolean {
  try {
    return Intl.getCanonicalLocales(tag).length === 1
  } catch {
    return false
  }
}
