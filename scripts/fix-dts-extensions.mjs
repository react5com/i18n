// Declaration-only emit retains source import extensions despite
// `rewriteRelativeImportExtensions`. Rewrite them for published type resolution.
// Run from a package directory; dist is relative to the current working directory.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      walk(path)
    } else if (path.endsWith('.d.ts')) {
      const original = readFileSync(path, 'utf8')
      const fixed = original
        // Vite extracts CSS separately; source CSS paths do not exist in dist.
        .replace(/^import\s+['"][^'"]*\.css['"];?\r?\n/gm, '')
        .replace(/(from\s+['"]\.[^'"]*?)\.(?:tsx?|jsx?)(['"])/g, '$1.js$2')
      if (fixed !== original) writeFileSync(path, fixed)
    }
  }
}

walk('dist')
