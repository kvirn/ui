import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vite-plus/test'
import { evaluate } from './gate-guard.ts'

const fresh = { fingerprint: 'a', seen: new Set<string>() }
const wrapped = (command: string) => `flock -w 1800 /tmp/kvirn-gate.lock ${command}`

describe('a heavy command goes through the gate lock', () => {
  it.each([
    'vp test run x.test.ts',
    'vp check src',
    'pnpm run ci:docker',
    'docker run --rm img',
    'vp run build',
  ])('blocks %s without the lock', (command) => expect(evaluate(command, fresh).allow).toBe(false))
  it.each(['vp test run x.test.ts', 'vp run test', 'docker build .'])(
    'allows %s under flock',
    (command) => expect(evaluate(wrapped(command), fresh).allow).toBe(true),
  )
  it('blocks the unwrapped part of a chain', () =>
    expect(evaluate(`${wrapped('vp check a')} && vp test run b`, fresh).allow).toBe(false))
  it('leaves cheap commands and quoted text alone', () => {
    for (const command of [
      'vp fmt a.ts',
      'git status',
      'grep -E "FAIL|vp test" log',
      "cat > f <<'EOF'\nvp test run\nEOF",
    ]) {
      expect(evaluate(command, fresh).allow).toBe(true)
    }
  })
})

describe('no loops, repeats or backgrounding around a gate', () => {
  it('blocks a for loop', () =>
    expect(evaluate(`for i in 1 2 3; do ${wrapped('vp test run a')}; done`, fresh).allow).toBe(
      false,
    ))
  it('blocks a gate sent to the background with &', () =>
    expect(evaluate(`${wrapped('vp run test')} &`, fresh).allow).toBe(false))
  it('blocks a busy loop', () => expect(evaluate('while :; do :; done', fresh).allow).toBe(false))
})

describe('the same command on the same tree runs once', () => {
  const command = wrapped('vp test run a.test.ts')
  it('blocks a repeat and allows it after the tree changed or with KVIRN_GATE_RERUN=1', () => {
    const seen = new Set([createHash('sha1').update(command).update('a').digest('hex')])
    expect(evaluate(command, { fingerprint: 'a', seen }).allow).toBe(false)
    expect(evaluate(command, { fingerprint: 'b', seen }).allow).toBe(true)
    expect(evaluate(`KVIRN_GATE_RERUN=1 ${command}`, { fingerprint: 'a', seen }).allow).toBe(true)
  })
})
