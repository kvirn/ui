// Runs the CI `gates` job in a container with a fixed CPU and memory budget, so a result doesn't depend on
// what else the host is doing. Host side builds the image and starts the container; the same file runs
// inside it with --inside.
//   pnpm run ci:docker [--step <name>]       KVIRN_CI_CPUS (4), KVIRN_CI_MEMORY (10g), KVIRN_CI_SHM (1g)
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  containerCommands,
  containerSteps,
  copyExcludes,
  gateLock,
  hostSteps,
  type CiStep,
} from './steps.ts'

const sourceDirectory = '/source'
const workDirectory = '/work'
const storeVolume = 'kvirn-ci-pnpm-store'

export interface StepResult {
  failed?: string
  code: number
  timings: { name: string; seconds: number }[]
}

export function selectSteps(steps: CiStep[], name?: string): CiStep[] {
  if (name === undefined) return steps
  const selected = steps.filter((step) => step.name === name)
  if (selected.length === 0) {
    throw new Error(`Unknown step "${name}". Steps: ${steps.map((step) => step.name).join(', ')}`)
  }
  return selected
}

export function runSteps(
  steps: CiStep[],
  execute: (step: CiStep) => number,
  log: (line: string) => void = console.log,
  now: () => number = Date.now,
): StepResult {
  const timings: StepResult['timings'] = []
  for (const step of steps) {
    log(`\n==> ${step.name}: ${step.command}`)
    const start = now()
    const code = execute(step)
    const seconds = Math.round((now() - start) / 100) / 10
    timings.push({ name: step.name, seconds })
    log(`<== ${step.name} ${code === 0 ? 'ok' : `exit ${code}`} in ${seconds}s`)
    if (code !== 0 && step.advisory) {
      log(`    ${step.name} is advisory: continuing`)
    } else if (code !== 0) {
      log(`\nFAILED at step "${step.name}"`)
      return { failed: step.name, code, timings }
    }
  }
  return { code: 0, timings }
}

export function copyCommand(from: string, to: string): [string, string[]] {
  const excludes = copyExcludes.flatMap((pattern) => [`--exclude=${pattern}`])
  return [
    'sh',
    [
      '-c',
      `tar -C "$1" ${excludes.map((e) => `'${e}'`).join(' ')} -cf - . | tar -C "$2" -xf -`,
      'copy',
      from,
      to,
    ],
  ]
}

export function copyWorkingTree(from: string, to: string): number {
  const [command, args] = copyCommand(from, to)
  return spawnSync(command, args, { stdio: 'inherit' }).status ?? 1
}

function shell(command: string, cwd: string): number {
  const path = `${cwd}/node_modules/.bin:${process.env.PATH ?? ''}`
  return (
    spawnSync('bash', ['-c', command], {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, PATH: path },
    }).status ?? 1
  )
}

function runInside(stepName?: string): number {
  const steps = selectSteps(containerSteps, stepName)
  if (copyWorkingTree(sourceDirectory, workDirectory) !== 0) return 1
  // Repo checks list files with `git ls-files --others --exclude-standard`; an empty repository gives
  // them the copy's files and the .gitignore rules without sharing the host's history.
  if (shell('git init -q', workDirectory) !== 0) return 1
  const install = runSteps(
    [{ name: 'install', command: 'pnpm install --frozen-lockfile' }],
    (step) => shell(step.command, workDirectory),
  )
  if (install.failed) return install.code
  const result = runSteps(steps, (step) =>
    shell(containerCommands[step.name] ?? step.command, workDirectory),
  )
  console.log('\nTimings')
  for (const { name, seconds } of [...install.timings, ...result.timings]) {
    console.log(`  ${name.padEnd(12)} ${seconds}s`)
  }
  return result.code
}

function docker(args: string[]): number {
  return spawnSync('docker', args, { stdio: 'inherit' }).status ?? 1
}

function readPnpmVersion(): string {
  const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
  return manifest.devEngines.packageManager.version
}

function ensureImage(): string {
  const directory = fileURLToPath(new URL('.', import.meta.url))
  const pnpmVersion = readPnpmVersion()
  const hash = createHash('sha256')
    .update(readFileSync(`${directory}Dockerfile`))
    .update(pnpmVersion)
    .digest('hex')
    .slice(0, 12)
  const tag = `kvirn-ci:${hash}`
  const exists = spawnSync('docker', ['image', 'inspect', tag], { stdio: 'ignore' }).status === 0
  if (!exists) {
    const code = docker([
      'build',
      '--build-arg',
      `PNPM_VERSION=${pnpmVersion}`,
      '-t',
      tag,
      directory,
    ])
    if (code !== 0) process.exit(code)
  }
  return tag
}

export function hostInvocation(command: string): [string, string[]] {
  const [lock = 'flock', ...lockArguments] = gateLock
  return [lock, [...lockArguments, 'bash', '-c', command]]
}

function runHostSteps(names: string[]): StepResult {
  const selected = hostSteps.filter((step) => names.includes(step.name))
  const hostRoot = fileURLToPath(new URL('../../', import.meta.url))
  return runSteps(
    selected.map((step) => ({ name: step.name, command: step.commands.join(' && ') })),
    (step) => {
      for (const command of hostSteps.find((hostStep) => hostStep.name === step.name)!.commands) {
        const [lock, lockArguments] = hostInvocation(command)
        const code = spawnSync(lock, lockArguments, { cwd: hostRoot, stdio: 'inherit' }).status ?? 1
        if (code !== 0) return code
      }
      return 0
    },
  )
}

function runContainer(stepName?: string): number {
  const tag = ensureImage()
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const insideArguments = ['--inside', ...(stepName ? ['--step', stepName] : [])]
  return docker([
    'run',
    '--rm',
    `--cpus=${process.env.KVIRN_CI_CPUS ?? '4'}`,
    `--memory=${process.env.KVIRN_CI_MEMORY ?? '10g'}`,
    `--shm-size=${process.env.KVIRN_CI_SHM ?? '1g'}`,
    '--ipc=host',
    // Chromium leaves child processes behind; PID 1 must reap them (Playwright's Docker advice).
    '--init',
    '-v',
    `${root}:${sourceDirectory}:ro`,
    '-v',
    `${storeVolume}:/pnpm-store`,
    tag,
    'node',
    `${sourceDirectory}/tooling/ci/docker-ci.ts`,
    ...insideArguments,
  ])
}

function runOnHost(stepName?: string): number {
  const hostNames = hostSteps.map((step) => step.name)
  const onHost = stepName !== undefined && hostNames.includes(stepName)
  if (stepName !== undefined && !onHost) selectSteps(containerSteps, stepName)
  const timings: StepResult['timings'] = []
  let code = 0
  let failed: string | undefined
  if (!onHost) {
    console.log('\n##### in the container: ' + containerSteps.map((step) => step.name).join(', '))
    code = runContainer(stepName)
    if (code !== 0) failed = 'container'
  }
  if (failed === undefined && (stepName === undefined || onHost)) {
    console.log(
      `\n##### on the host: ${hostNames.filter((name) => !onHost || name === stepName).join(', ')}`,
    )
    const result = runHostSteps(onHost ? [stepName] : hostNames)
    timings.push(...result.timings)
    code = result.code
    failed = result.failed
  }
  console.log('\nHost timings')
  for (const { name, seconds } of timings) console.log(`  ${name.padEnd(12)} ${seconds}s`)
  console.log(failed ? `\nRED: ${failed}` : '\nGREEN')
  return code
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const stepIndex = args.indexOf('--step')
  const stepName = stepIndex === -1 ? undefined : args[stepIndex + 1]
  try {
    process.exit(args.includes('--inside') ? runInside(stepName) : runOnHost(stepName))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(2)
  }
}
