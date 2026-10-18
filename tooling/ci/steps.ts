// The `gates` job of .github/workflows/ci.yml, in order. A test keeps this list equal to the workflow.

export interface CiStep {
  name: string
  command: string
  advisory?: boolean
}

// `vp install` and the Playwright download run in the entrypoint instead: the image has Chromium, and the
// install uses the frozen lockfile against a shared pnpm store.
export const setupCommands = ['vp install', 'pnpm exec playwright install --with-deps chromium']

export const ciSteps: CiStep[] = [
  { name: 'build', command: 'vp run build' },
  { name: 'check', command: 'vp check --no-fmt' },
  { name: 'fmt', command: 'vp fmt --check', advisory: true },
  { name: 'test', command: 'vp run test' },
  {
    name: 'sweep',
    command:
      'vp test run --project storybook-forced-colors && vp test run --project storybook-reduced-motion && vp test run --project storybook-reflow && vp test run --project storybook-text-spacing',
  },
  { name: 'i18n:check', command: 'vp run i18n:check' },
  { name: 'theme:check', command: 'vp run theme:check' },
]

// The same work as the workflow's `vp run build` (root script `vp run -r build`) with a lower task
// concurrency: four parallel `tsgo` declaration builds need more than the 6 GB a container gets on a
// 7.75 GiB Docker VM and are OOM-killed (SIGKILL). Fewer at a time is slower and never red for memory.
export const buildConcurrency = process.env.KVIRN_CI_BUILD_CONCURRENCY ?? '2'
export const containerCommands: Record<string, string> = {
  build: `vp run -r --concurrency-limit ${buildConcurrency} build`,
  test: 'vp test run --project node --project browser',
}

// Chromium drops its connection in one Storybook file per container run, so the Storybook projects run
// on the host checkout under the gate lock. Together with `containerCommands.test` they are the
// workflow's `vp run test`; `sweep` is the workflow's command, split at `&&`.
export interface HostStep {
  name: string
  commands: string[]
}

export const hostSteps: HostStep[] = [
  {
    name: 'storybook',
    commands: [
      'vp test run --project storybook',
      'vp test run --project storybook-dark',
      'vp test run --project storybook-light-contrast',
      'vp test run --project storybook-dark-contrast',
    ],
  },
  {
    name: 'sweep',
    commands: ciSteps.find((step) => step.name === 'sweep')!.command.split(' && '),
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
