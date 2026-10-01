import { defineConfig, devices } from '@playwright/test'

const storybookUrl = 'http://localhost:6006'

// Keyboard contract, focus and display modes, run against Storybook (docs/engineering.md). The
// specs live next to their stories in apps/storybook/src/components/<name>/.
export default defineConfig({
  testDir: 'apps/storybook/src',
  testMatch: ['**/*.e2e.ts'],
  forbidOnly: true,
  fullyParallel: true,
  retries: 0,
  reporter: process.env['CI'] === undefined ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: storybookUrl,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'chromium-forced-colors',
      use: { ...devices['Desktop Chrome'], forcedColors: 'active' },
    },
    {
      name: 'chromium-reduced-motion',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    // 1.4.10 Reflow: 1280px at 400% zoom is 320 CSS px wide.
    {
      name: 'reflow-320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 256 } },
    },
  ],
  webServer: {
    command: 'pnpm --filter @kvirn-ui/storybook dev',
    url: storybookUrl,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 120_000,
  },
})
