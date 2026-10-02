import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  // Let the consuming app decide whether missing-message diagnostics are enabled.
  // Library builds otherwise permanently replace DEV with false.
  define: { 'import.meta.env.DEV': 'import.meta.env.DEV' },
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'i18n',
    },
    rollupOptions: {
      external: [/^intl-messageformat(\/|$)/, /^@formatjs\//],
    },
    emptyOutDir: false,
  },
})
