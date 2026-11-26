// The `ci` script of package.json, which the `gates` job of .github/workflows/ci.yml runs, split at `&&`.
// A test keeps this list equal to the script.

export interface CiStep {
  name: string
  command: string
  advisory?: boolean
}

// `vp install` and the Playwright download run in the entrypoint instead: the image has Chromium, and the
// install uses the frozen lockfile against a shared pnpm store.
export const setupCommands = ['vp install', 'pnpm exec playwright install --with-deps chromium']

export const ciSteps: CiStep[] = [
  { name: 'fmt', command: 'vp fmt --check' },
  { name: 'build', command: 'vp run build' },
  { name: 'lint', command: 'vp lint' },
  { name: 'check', command: 'pnpm run check' },
  { name: 'test', command: 'pnpm run test' },
  { name: 'i18n:check', command: 'pnpm run i18n:check' },
  { name: 'theme:check', command: 'pnpm run theme:check' },
  { name: 'sweep', command: 'pnpm run sweep' },
]

// The same work as the script's `vp run build` (root script `vp run -r build`) with a lower task
// concurrency: four parallel `tsgo` declaration builds need more than the 6 GB a container gets on a
// 7.75 GiB Docker VM and are OOM-killed (SIGKILL). Fewer at a time is slower and never red for memory.
export const buildConcurrency = process.env.KVIRN_CI_BUILD_CONCURRENCY ?? '2'
export const containerCommands: Record<string, string> = {
  build: `vp run -r --concurrency-limit ${buildConcurrency} build`,
  test: 'vp test run --project node --project browser',
}

// Chromium drops its connection in one Storybook file per container run, so the Storybook projects run
// on the host checkout under the gate lock. Together with `containerCommands.test` they are the
// script's `pnpm run test`; `sweep` is the script's `sweep` command, split at `&&`.
export interface HostStep {
  name: string
  commands: string[]
}

const sweepCommand =
  'node tooling/storybook-run/storybook-run.ts storybook-forced-colors storybook-reduced-motion storybook-reflow storybook-text-spacing'

export const hostSteps: HostStep[] = [
  {
    name: 'storybook',
    commands: ['node tooling/storybook-run/storybook-run.ts storybook'],
  },
  {
    name: 'sweep',
    commands: [sweepCommand],
  },
]

export const gateLock = ['flock', '-w', '1800', '/tmp/kvirn-gate.lock']

export const containerSteps: CiStep[] = ciSteps.filter(
  (step) => !hostSteps.some((hostStep) => hostStep.name === step.name),
)

// Dependencies, build output and caches are rebuilt in the container, never shared with the host.
export const copyExcludes = [
  'node_modules',
  '.git',
  '.cache',
  '.vitest',
  '.vite',
  '.turbo',
  '.next',
  'dist',
  'storybook-static',
  'coverage',
  '*.tsbuildinfo',
]
