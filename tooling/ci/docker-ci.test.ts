import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { copyWorkingTree, hostInvocation, runSteps, selectSteps } from './docker-ci.ts'
import { ciSteps, containerCommands, containerSteps, hostSteps, setupCommands } from './steps.ts'

const root = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

function gatesRunCommands(): string[] {
  const lines = read('.github/workflows/ci.yml').split('\n')
  const start = lines.findIndex((line) => /^ {2}gates:/.test(line))
  const commands: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^ {2}\S/.test(line)) break
    const match = /^ {6}- run: (.+)$/.exec(line)
    if (match) commands.push(match[1]!.trim())
  }
  return commands
}

describe('row 1: the container runs the ci.yml gates steps in order', () => {
  it('lists the gates run commands, setup first, in the workflow order', () => {
    expect(gatesRunCommands()).toEqual([...setupCommands, ...ciSteps.map((step) => step.command)])
  })

  it('marks only the formatting check advisory, as the workflow does', () => {
    expect(ciSteps.filter((step) => step.advisory).map((step) => step.command)).toEqual([
      'vp fmt --check',
    ])
  })

  it('--step selects one step and rejects an unknown name', () => {
    expect(selectSteps(ciSteps, 'i18n:check').map((step) => step.command)).toEqual([
      'vp run i18n:check',
    ])
    expect(() => selectSteps(ciSteps, 'nope')).toThrow(/Unknown step/)
  })
})

describe('row 2: a private copy of the working tree', () => {
  it('copies uncommitted files and leaves out node_modules, .git and caches', () => {
    const from = mkdtempSync(join(tmpdir(), 'kvirn-ci-from-'))
    const to = mkdtempSync(join(tmpdir(), 'kvirn-ci-to-'))
    for (const directory of [
      'src',
      'node_modules/pkg',
      'packages/a/node_modules/b',
      '.git/objects',
      '.cache',
      'packages/a/.vitest',
    ]) {
      mkdirSync(join(from, directory), { recursive: true })
      writeFileSync(join(from, directory, 'file'), 'x')
    }
    writeFileSync(join(from, 'src/edited.ts'), 'uncommitted')

    expect(copyWorkingTree(from, to)).toBe(0)

    expect(readFileSync(join(to, 'src/edited.ts'), 'utf8')).toBe('uncommitted')
    for (const excluded of [
      'node_modules',
      'packages/a/node_modules',
      '.git',
      '.cache',
      'packages/a/.vitest',
    ]) {
      expect(existsSync(join(to, excluded))).toBe(false)
    }
  })
})

describe('row 3: the first red step stops the run, named, non-zero', () => {
  const steps = [
    { name: 'one', command: 'a' },
    { name: 'two', command: 'b' },
    { name: 'three', command: 'c' },
  ]

  it('stops at the failing step and reports its name and code', () => {
    const ran: string[] = []
    const lines: string[] = []
    const result = runSteps(
      steps,
      (step) => (ran.push(step.name), step.name === 'two' ? 3 : 0),
      (line) => lines.push(line),
    )
    expect(ran).toEqual(['one', 'two'])
    expect(result).toMatchObject({ failed: 'two', code: 3 })
    expect(lines.join('\n')).toContain('FAILED at step "two"')
  })

  it('continues past a failing advisory step', () => {
    const result = runSteps(
      [{ name: 'fmt', command: 'f', advisory: true }, ...steps],
      (step) => (step.name === 'fmt' ? 1 : 0),
      () => {},
    )
    expect(result.code).toBe(0)
    expect(result.timings).toHaveLength(4)
  })

  it('prints the time of every step', () => {
    const lines: string[] = []
    let clock = 0
    runSteps(
      [steps[0]!],
      () => 0,
      (line) => lines.push(line),
      () => (clock += 2500),
    )
    expect(lines.join('\n')).toContain('one ok in 2.5s')
  })
})

describe('row 4: pinned image, Playwright equals the catalog', () => {
  const dockerfile = read('tooling/ci/Dockerfile')

  it('pins the base image by tag and digest', () => {
    const from = /^FROM (\S+)$/m.exec(dockerfile)![1]!
    expect(from).toMatch(
      /^mcr\.microsoft\.com\/playwright:v\d+\.\d+\.\d+-[a-z]+@sha256:[0-9a-f]{64}$/,
    )
    expect(from).not.toMatch(/:latest|:v\d+(\.\d+)?-/)
  })

  it('uses the Playwright version of the catalog', () => {
    const catalog = /^ {2}playwright: (\S+)$/m.exec(read('pnpm-workspace.yaml'))![1]!
    expect(/playwright:v([\d.]+)-/.exec(dockerfile)![1]).toBe(catalog)
  })
})

describe('row 1: container and host steps together are the ci.yml test and sweep', () => {
  const stepNamed = (name: string) => hostSteps.find((step) => step.name === name)!

  it('container test plus the host Storybook projects are the package.json test script, in order', () => {
    const script = JSON.parse(read('package.json')).scripts.test as string
    const commands = [containerCommands.test!, ...stepNamed('storybook').commands]
    expect(commands.join(' && ')).toBe(script)
    expect(ciSteps.find((step) => step.name === 'test')!.command).toBe('vp run test')
  })

  it('the host sweep is the ci.yml sweep command unchanged', () => {
    const sweep = ciSteps.find((step) => step.name === 'sweep')!.command
    expect(stepNamed('sweep').commands.join(' && ')).toBe(sweep)
  })

  it('the container runs every ci.yml step except the host sweep', () => {
    expect(containerSteps.map((step) => step.name)).toEqual(
      ciSteps.map((step) => step.name).filter((name) => name !== 'sweep'),
    )
  })
})

describe('row 3: a host step runs through the gate lock', () => {
  it('wraps the command in flock on the gate lock file', () => {
    const [command, args] = hostInvocation('vp test run --project storybook')
    expect([command, ...args]).toEqual([
      'flock',
      '-w',
      '1800',
      '/tmp/kvirn-gate.lock',
      'bash',
      '-c',
      'vp test run --project storybook',
    ])
  })
})
