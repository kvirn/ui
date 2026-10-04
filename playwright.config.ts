import { defineConfig, devices } from '@playwright/test'

const storybookUrl = 'http://localhost:6006'

// The baseline is one project, `chromium`: the keyboard contract, focus and
// the story-state checks all run in Chrome. The display-mode projects (forced colours, reduced
// motion, 320px reflow) and the other engines are defined but off, because they repeat every test
// and are for a dedicated WCAG sweep. Turn them on with `E2E_BROWSERS`, a comma-separated list of
// project names or keywords: `sweep` (the three display-mode projects) or `all` (every project).
// Examples: `E2E_BROWSERS=sweep vp run e2e <spec>`, `E2E_BROWSERS=firefox vp run e2e <spec> --project firefox`.
const baselineProjects = [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]

const sweepProjects = [
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
  requested.includes(name) ||
  (requested.includes('sweep') && sweepProjects.some((project) => project.name === name))
const projects = [...baselineProjects, ...sweepProjects, ...optionalProjects]

// Keyboard contract, focus and display modes, run against Storybook (docs/engineering.md). The
// specs live next to their stories in apps/storybook/src/components/<name>/.
//
// Workers: Playwright's default is half the CPU cores, which on a 28-thread machine is 14 Chrome
// pages hammering one Storybook dev server, and makes the timing-based tests flaky. Locally the
// tests run one at a time, next to the dev server, the editor and other sessions; CI runs three.
// Raise it for a one-off with `E2E_WORKERS=3 vp run e2e <spec>`.
const workers = Number(process.env['E2E_WORKERS'] ?? (process.env['CI'] === undefined ? 1 : 3))
export default defineConfig({
  testDir: 'apps/storybook/src',
  testMatch: ['**/*.e2e.ts'],
  forbidOnly: true,
  fullyParallel: true,
  retries: 0,
  workers,
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
