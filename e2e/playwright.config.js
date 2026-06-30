// [5.17] Playwright config for the Bloglist e2e suite.
// Tests run against the Vite dev server at http://localhost:5173, which
// in turn proxies /api/* to the backend at :3003. Both must be running
// manually before invoking `npm test` (or `npm run test:headed`).
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      // [5.17] use the system's installed Chrome instead of downloading
      // Playwright's bundled Chromium build (avoids slow CDN download).
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})
