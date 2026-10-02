import { IntlMessageFormat } from 'intl-messageformat'

/** ICU text messages, including cardinal/ordinal plurals and nested select clauses.
 * Missing arguments and invalid messages throw; they must never erase visible text.
 */
export function formatMessage(
  template: string,
  values: Record<string, string | number | Date> = {},
  locale = 'en',
): string {
  return String(
    new IntlMessageFormat(template, locale.replaceAll('_', '-'), undefined, {
      ignoreTag: true,
    }).format(values),
  )
}
