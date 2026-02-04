import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.test.tsx', 'src/**/__tests__/*.test.tsx', 'src/**/__tests__/*.test.ts']
  }
})
