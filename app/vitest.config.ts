import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['components/**/*.test.tsx', 'jsdom'],
      ['components/**/*.test.ts', 'jsdom'],
      ['hooks/**/*.test.ts', 'jsdom'],
    ],
    include: [
      'lib/**/*.test.ts',
      'hooks/**/*.test.ts',
      'middleware.test.ts',
      'next.config.test.ts',
      'app/**/*.test.ts',
      'scripts/**/*.test.ts',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
