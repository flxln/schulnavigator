import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['components/**/*.test.tsx', 'jsdom']],
    include: [
      'lib/**/*.test.ts',
      'middleware.test.ts',
      'components/**/*.test.tsx',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
