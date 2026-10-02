import { defineConfig, devices } from '@playwright/test'

const storybookUrl = 'http://localhost:6006'

// The baseline is Chromium only (ADR-0042): the keyboard contract, focus and the display modes
// all run in Chrome, with forced colours, reduced motion and the 320px reflow as Chromium
// projects. Other engines and devices are defined but off. Turn them on with `E2E_BROWSERS`:
// `E2E_BROWSERS=firefox,webkit vp run e2e <spec> --project firefox`, or `E2E_BROWSERS=all`.
const baselineProjects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  {
    name: 'chromium-forced-colors',
    use: { ...devices['Desktop Chrome'], forcedColors: 'active' },
  },
  {
    name: 'chromium-reduced-motion',
    use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
  },
  // 1.4.10 Reflow: 1280px at 400% zoom is 320 CSS px wide.
  {
    name: 'reflow-320',
    use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 256 } },
  },
]

const optionalProjects = [
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
]

const requested = (process.env['E2E_BROWSERS'] ?? '')
  .split(',')
  .map((name) => name.trim())
  .filter((name) => name !== '')
const isEnabled = (name: string): boolean =>
  baselineProjects.some((project) => project.name === name) ||
  requested.includes('all') ||
  requested.includes(name)
const projects = [...baselineProjects, ...optionalProjects]

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
  projects: projects.filter(({ name }) => isEnabled(name)),
  webServer: {
    command: 'pnpm --filter @kvirn-ui/storybook dev',
    url: storybookUrl,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 120_000,
  },
})
