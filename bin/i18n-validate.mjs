#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, TYPE } from '@formatjs/icu-messageformat-parser'

function argumentsOf(message) {
  const args = new Set()
  function visit(nodes) {
    for (const node of nodes) {
      if (node.type !== TYPE.literal && node.type !== TYPE.pound) {
        args.add(`${node.value}:${node.type}`)
      }
      if ('options' in node) for (const option of Object.values(node.options)) visit(option.value)
    }
  }
  visit(parse(message, { ignoreTag: true }))
  return [...args].sort().join(',')
}

export function validateCatalog(english, translated, context) {
  if (!translated || typeof translated !== 'object' || Array.isArray(translated)) {
    throw new Error(`${context}: expected a message group`)
  }
  if (Object.keys(english).sort().join('\n') !== Object.keys(translated).sort().join('\n')) {
    throw new Error(`${context}: missing or extra keys`)
  }
  for (const [key, value] of Object.entries(english)) {
    const next = translated[key]
    if (typeof value === 'object') validateCatalog(value, next, `${context}.${key}`)
    else {
      if (typeof next !== 'string' || !next.trim())
        throw new Error(`${context}.${key}: empty message`)
      try {
        if (argumentsOf(value) !== argumentsOf(next)) throw new Error('mismatched placeholders')
      } catch (error) {
        throw new Error(`${context}.${key}: ${error.message}`)
      }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve(process.argv[2] ?? 'src/locales')
  const readCatalog = async (file) => JSON.parse(await readFile(resolve(directory, file), 'utf8'))
  const english = await readCatalog('en.json')
  for (const file of await readdir(directory)) {
    if (!file.endsWith('.json')) continue
    validateCatalog(english, await readCatalog(file), file)
  }
  console.log(`Validated translations in ${directory}`)
}
