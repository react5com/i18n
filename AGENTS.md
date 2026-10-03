# AGENTS.md

Onboarding notes for AI coding agents working in this repository.

## Project

`@react5/i18n` is a small, framework-free, published npm library of localization utilities. Keep it generic:
no UI, no bundled translations, no knowledge of any particular app's locales.

## Layout

- `src/index.ts` — the public API; export everything public from here.
- `src/locale.ts` — `Locale`, `languageOf(locale, supported, fallback?)`, `languageSubtag`.
- `src/resolveMessages.ts` — per-message fallback and overrides; warns on missing messages only when
  the host passes `warnOnMissing` (never read `import.meta.env` in the library: Vite pre-bundles
  dependencies without it and the module would throw at load).
- `src/formatMessage.ts` — ICU formatting via `intl-messageformat`; throws on bad input.
- `src/store.ts` — `createI18nStore`, `I18nStore`, `LocaleSource`, `LocaleListener`.
- `src/format.ts` — `Intl` wrappers: `formatDate`, `formatDateTime`, `formatHours`, `compareText`, `formatLocale`.
- `src/negotiate.ts` — `negotiateLocale`, `isValidTimeZone`, `isValidLocaleTag`.
- `src/firstDayOfWeek.ts` — locale-aware week start.
- `bin/i18n-validate.mjs` — the `i18n-validate` CLI and `validateCatalog`; plain ESM, no build step.
- `tests/` — Vitest for `src/` (`*.test.ts`) and `node:test` for the CLI (`validate.test.mjs`).

## Commands

- `npm run build` — type-check, emit declarations, fix declaration import extensions
  (`scripts/fix-dts-extensions.mjs`), bundle with Vite to `dist/i18n.js`.
- `npm test` — CLI tests, then Vitest. `npm run typecheck` — `tsc --noEmit`.
- `npm publish` runs `prepublishOnly` (build + test). Dependencies stay external in the bundle.

## Rules

- Code style: Prettier (`.prettierrc.json`: single quotes, no semicolons, width 100), ESM only,
  `.ts` import extensions in source.
- **Never run `git commit`**; leave changes for the user to review and commit.
