/** BCP 47 locale tag. Regional tags (for example, `fr-CA`) use their language's messages. */
export type Locale = string

/** The language subtag of `locale`, lower-cased (`'fr_CA'` → `'fr'`). */
export function languageSubtag(locale: Locale): string {
  return locale.trim().replace('_', '-').split('-')[0].toLowerCase()
}

/**
 * Maps a locale to the closest entry of `supported` by language subtag, or to `fallback`
 * (default: the first supported language) when there is none.
 */
export function languageOf<L extends string>(
  locale: Locale | undefined,
  supported: readonly L[],
  fallback: L = supported[0],
): L {
  if (!locale) return fallback
  const language = languageSubtag(locale)
  return (supported as readonly string[]).includes(language) ? (language as L) : fallback
}
