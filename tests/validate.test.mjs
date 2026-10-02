import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateCatalog } from '../bin/i18n-validate.mjs'

test('rejects missing/extra keys, renamed arguments, invalid ICU and changed argument kinds', () => {
  const en = { greeting: 'Hello {name}', count: '{n, plural, one {# task} other {# tasks}}' }
  for (const bad of [
    { greeting: 'Hello {name}' },
    { ...en, extra: 'Extra' },
    { ...en, greeting: 'Hello {person}' },
    { ...en, count: '{n, plural, one {# task}}' },
    { ...en, count: '{n}' },
    { ...en, greeting: '' },
  ])
    assert.throws(() => validateCatalog(en, bad, 'fr'))
})

test('allows language-specific plural branches and checks nested arguments', () => {
  const en = { count: '{n, plural, one {{name}: # task} other {{name}: # tasks}}' }
  assert.doesNotThrow(() =>
    validateCatalog(en, { count: '{n, plural, other {{name}: # 件}}' }, 'ja'),
  )
  assert.throws(() => validateCatalog(en, { count: '{n, plural, other {{who}: # 件}}' }, 'ja'))
})

test('rejects invalid JSON group shapes with a contextual diagnostic', () => {
  for (const group of [null, [], 'text', 5]) {
    assert.throws(
      () => validateCatalog({ tasks: { title: 'Title' } }, { tasks: group }, 'fr.json'),
      /fr\.json\.tasks: expected a message group/,
    )
  }
})
