#!/usr/bin/env node
// PreToolUse (Bash), test-runner and component-engineer only. Called by guard-subagent-checks.sh.
// They may run tests, but only scoped to the work at hand, one module per command, in the foreground,
// and only when no other run is going (and, for the test-runner, nobody is editing). Full-tree runs
// belong to the orchestrator's sweeps and CI.
// Exit 2 = block and feed stderr back to Claude.
import { existsSync } from 'node:fs'
import path from 'node:path'
import { preflight } from './test-preflight.mjs'

const input = await new Promise((resolve) => {
  let text = ''
  process.stdin.on('data', (chunk) => (text += chunk)).on('end', () => resolve(text))
})

let toolInput = {}
let startDirectory = process.cwd()
let agentType = 'subagent'
try {
  const parsed = JSON.parse(input)
  toolInput = parsed.tool_input ?? {}
  startDirectory = parsed.cwd ?? startDirectory
  agentType = parsed.agent_type ?? agentType
} catch {
  process.exit(0)
}

function block(message) {
  console.error(
    `Blocked (${agentType}, scoped-run guard; see the testing skill, test-runner-guard): ${message}`,
  )
  process.exit(2)
}

// Flags whose next token is a value, not a path.
const valueFlags = new Set([
  '--project',
  '-t',
  '--testNamePattern',
  '--reporter',
  '--config',
  '-c',
  '--root',
  '-r',
  '--dir',
  '--exclude',
  '--environment',
  '--outputFile',
  '--repeat-each',
  '--grep',
  '-g',
  '--trace',
  '--timeout',
])
// Flags that widen, parallelise, retry or rewrite: never for a scoped run.
const forbiddenFlags = new Set([
  '--changed',
  '-u',
  '--update',
  '--retry',
  '--retries',
  '--maxWorkers',
  '--max-workers',
  '--workers',
  '-j',
  '--watch',
  '-w',
  '--fix',
  '--ui',
  '--shard',
  '--fileParallelism',
  '--pass-with-no-tests',
])
const forbiddenEnvironment = new Set(['VITEST_MAX_WORKERS', 'E2E_BROWSERS', 'CI'])
// Paths that cover a whole package, app or the tree: that's a sweep, not a module.
const broadPath =
  /^(\.|\.\/|packages|apps|tooling|src|(packages|apps)\/[^/]+(\/src)?|apps\/storybook\/src\/components)\/?$/

const command = String(toolInput.command ?? '')
const segments = command
  .replace(/"[^"]*"/g, '')
  .replace(/'[^']*'/g, '')
  .split(/&&|\|\||[;&|\n]/)

let directory = startDirectory
let scopedRuns = 0
let needsPreflight = false

for (const raw of segments) {
  const tokens = raw.trim().split(/\s+/).filter(Boolean)
  const environment = []
  while (tokens.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[0]))
    environment.push(tokens.shift().split('=')[0])
  if (tokens.length === 0) continue
  const [first, second, third] = tokens

  if (first === 'cd' && second !== undefined) {
    directory = path.resolve(directory, second)
    continue
  }

  const direct = ['vitest', 'playwright', 'tsc', 'storybook']
  if (
    direct.includes(first) ||
    ((first === 'npx' || first === 'pnpm') &&
      direct.includes(second === 'exec' ? third : second)) ||
    (first === 'pnpm' &&
      (second === 'e2e' || second === 'test' || second === 'run' || second === 'build'))
  ) {
    block(
      'run tests through `vp test run <paths>` or `vp run e2e <spec> --project chromium`, so the run stays scoped.',
    )
  }

  if (first !== 'vp') continue
  const forbiddenVariable = environment.find((name) => forbiddenEnvironment.has(name))
  if (forbiddenVariable !== undefined) {
    block(
      `don't set ${forbiddenVariable}. Worker counts, sweeps and CI mode are the orchestrator's call.`,
    )
  }

  let rest
  if (second === 'test') {
    if (third !== 'run' && third !== 'related') {
      block(
        'use `vp test run <paths>` or `vp test related <paths>`. A bare `vp test` watches, and other subcommands are out of scope.',
      )
    }
    rest = tokens.slice(3)
  } else if (second === 'check' || second === 'lint') {
    rest = tokens.slice(2)
  } else if (second === 'run') {
    if (third === 'i18n:check' || third === 'theme:check') {
      needsPreflight = true
      continue
    }
    if (third === 'e2e') {
      // guard-e2e-scope.sh already demands a spec.
      const flag = tokens.slice(3).find((token) => forbiddenFlags.has(token.split('=')[0]))
      if (flag !== undefined) block(`\`${flag}\` is not allowed in a scoped run.`)
      if (background()) block('run e2e in the foreground, so nothing else starts while it runs.')
      scopedRuns++
      needsPreflight = true
      continue
    }
    block(
      `\`vp run ${third ?? ''}\` is not a test task. Scoped runs are \`vp test\`, \`vp check\`, \`vp run e2e\`, \`i18n:check\` and \`theme:check\` only.`,
    )
  } else if (second === 'fmt' || second === 'build' || second === 'pack' || second === 'install') {
    block(
      `\`vp ${second}\` isn't a scoped test run. The edit hook formats files, and builds are the orchestrator's.`,
    )
  } else {
    continue
  }

  const paths = []
  let hasProject = false
  for (let index = 0; index < rest.length; index++) {
    const token = rest[index]
    if (/^\d*>/.test(token) || token === '--') continue
    const flag = token.split('=')[0]
    if (forbiddenFlags.has(flag)) block(`\`${flag}\` is not allowed in a scoped run.`)
    if (flag === '--project') hasProject = true
    if (token.startsWith('-')) {
      if (valueFlags.has(token)) index++
      continue
    }
    paths.push(token)
  }

  if (paths.length === 0) {
    block(
      `\`vp ${second}\` needs the paths of the module under test. A path-less run is a full sweep, which only the orchestrator runs.`,
    )
  }
  for (const target of paths) {
    const normal = target.replace(/\/+$/, '')
    if (target.includes('*') || broadPath.test(normal)) {
      block(
        `\`${target}\` covers a whole package or the tree. Pass the module's files or its directory, e.g. packages/react/src/listbox.`,
      )
    }
    if (!existsSync(path.resolve(directory, target))) {
      block(
        `\`${target}\` doesn't exist. Vitest treats a filter as a substring, so a loose word can match the whole suite. Pass real paths.`,
      )
    }
  }
  if (second === 'test' && !hasProject && paths.some((target) => target.includes('.stories.'))) {
    block(
      'a stories file runs in all four storybook projects at once, which flakes. Add `--project storybook`, and the other theme projects one at a time only if theming changed.',
    )
  }
  if (background()) block('run tests in the foreground, so nothing else starts while they run.')
  scopedRuns++
  needsPreflight = true
}

function background() {
  return toolInput.run_in_background === true || /(^|[^&])&\s*$/.test(command.trim())
}

if (scopedRuns > 1) {
  block('one module per command. Run each module on its own and wait for it to finish.')
}

if (needsPreflight) {
  const result = preflight(directory)
  if (result.busy) {
    block(
      [
        'not now: the tree is not quiet.',
        ...result.reasons.map((reason) => `  - ${reason}`),
        'Run `node .claude/hooks/test-preflight.mjs --wait 120` and retry once it says CLEAR. If it stays BUSY, stop and report it.',
      ].join('\n'),
    )
  }
}
process.exit(0)
