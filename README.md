# @react5/i18n

Small, framework-free localization utilities for TypeScript/JavaScript apps and component
libraries.

- **`formatMessage`** — ICU MessageFormat (plurals, ordinals, selects) via `intl-messageformat`.
- **`resolveMessages`** — pick a message group by locale, with per-message fallback and overrides.
- **`createI18nStore`** — current locale plus change subscriptions.
- **`languageOf`** — map a BCP 47 tag (`fr-CA`, `fr_CA`) to one of your supported languages.
- **`firstDayOfWeek`** — locale-aware first day of the week.
- **`negotiateLocale`**, **`isValidTimeZone`**, **`isValidLocaleTag`** — pick a supported language from `navigator.languages`; validate stored preferences.
- **`formatDate`**, **`formatDateTime`**, **`formatHours`**, **`compareText`**, **`formatLocale`** — locale-aware `Intl` wrappers (date-only `YYYY-MM-DD` strings are never shifted by the time zone; invalid dates format as an empty string).
- **`i18n-validate`** — CLI that checks translation JSON files against the English catalog.

## Install

```sh
npm install @react5/i18n
```

## Usage

```ts
import { createI18nStore, formatMessage, languageOf, resolveMessages } from '@react5/i18n'

const MESSAGES = {
  en: { tasks: '{count, plural, one {# task} other {# tasks}}', close: 'Close' },
  fr: { tasks: '{count, plural, one {# tâche} other {# tâches}}', close: 'Fermer' },
}

const i18n = createI18nStore('fr-CA')
i18n.subscribe((locale) => console.log('locale changed to', locale))

const messages = i18n.resolve(MESSAGES, { close: 'Annuler' }) // overrides win
formatMessage(messages.tasks, { count: 2 }, i18n.locale) // "2 tâches"

languageOf('de-AT', ['en', 'fr']) // "en" (first entry is the default fallback)
```

### `resolveMessages(locale, dictionaries, overrides?, fallback = 'en')`

`dictionaries` is keyed by language. A message missing from the selected language falls back to
the `fallback` dictionary (which must exist and defines the full set of keys). In dev builds of
the host app (`import.meta.env.DEV`) missing messages are logged with `console.warn`.

### `formatMessage(template, values?, locale = 'en')`

Throws on missing arguments or malformed ICU instead of silently rendering partial text.

## Validating translations

Keep one JSON file per language in a directory (default `src/locales`), with `en.json` as the
reference. Nested objects are message groups.

```json
{ "scripts": { "check:translations": "i18n-validate" } }
```

```sh
npx i18n-validate [directory]
```

It fails when a file has missing or extra keys, empty messages, invalid ICU syntax, or
placeholders that differ from English (plural branches may differ per language).

## License

MIT
