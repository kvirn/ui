// Claude Code PreToolUse guard for Bash: AGENTS.md rule 12 as code. A heavy command (a gate, a build,
// a container) must go through the gate lock, must not sit in a loop or run in the background of one,
// and must not be run again on a tree that has not changed since it last ran.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface Verdict {
  allow: boolean
  reason?: string
}

const lockPath = '/tmp/kvirn-gate.lock'
const wrapper = `flock -w 1800 ${lockPath} <command>`

const heavy: Record<string, RegExp> = {
  vp: /^(test|check|lint|run|pack|build|dev|preview)\b/,
  pnpm: /^(run|exec|test|build|dlx)\b/,
  npx: /./,
  next: /^(build|dev)\b/,
  docker: /^(run|build|compose|buildx)\b/,
}

// Text inside quotes and heredoc bodies is data, not a command.
function strip(command: string): string {
  return command
    .replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2(?=\n|$)/g, ' ')
    .replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, '""')
}

function words(segment: string): string[] {
  const tokens = segment.trim().split(/\s+/)
  while (
    tokens.length > 0 &&
    /^([A-Za-z_][A-Za-z0-9_]*=\S*|time|nohup|env|command|exec|do|then|else|\{|\()$/.test(tokens[0]!)
  ) {
    tokens.shift()
  }
  return tokens
}

function isHeavy(segment: string): boolean {
  const [program, subcommand = ''] = words(segment)
  const pattern = program === undefined ? undefined : heavy[program]
  return pattern !== undefined && pattern.test(subcommand)
}

export function evaluate(
  command: string,
  state: { fingerprint: string; seen: ReadonlySet<string> },
): Verdict {
  const text = strip(command)
  const segments = text.split(/&&|\|\||;|\n|\||&(?!>)/)
  const flocked = (segment: string) => words(segment)[0] === 'flock'
  const anyHeavy = segments.some(
    (segment) =>
      isHeavy(segment) ||
      (flocked(segment) && isHeavy(segment.replace(/^.*?flock\s+(-\S+\s+\S+\s+)*\S+\s+/, ''))),
  )

  if (/\b(while|until)\s+(:|true|\[)/.test(text) && /do\s*:?\s*;?\s*done|do\s+:\s*;/.test(text)) {
    return { allow: false, reason: 'A busy loop starves the machine. Do not generate CPU load.' }
  }
  if (
    anyHeavy &&
    /\b(for|while|until)\b|\bseq\b|\bxargs\s+-P|\brepeat\b|--repeat|--retry/.test(text)
  ) {
    return {
      allow: false,
      reason:
        'No loops or repeats around a gate: run it once and diagnose a failure from its output. A flake is reported with its test name, never re-run in a loop.',
    }
  }
  if (anyHeavy && /&\s*$/.test(text.trim())) {
    return {
      allow: false,
      reason:
        'Do not background a gate: use run_in_background on the tool call instead, so one runs at a time.',
    }
  }
  for (const segment of segments) {
    if (isHeavy(segment) && !flocked(segment)) {
      return {
        allow: false,
        reason: `Run it through the gate lock (AGENTS.md rule 12): ${wrapper}`,
      }
    }
  }
  if (anyHeavy && !/\bKVIRN_GATE_RERUN=1\b/.test(command)) {
    const key = createHash('sha1').update(command.trim()).update(state.fingerprint).digest('hex')
    if (state.seen.has(key)) {
      return {
        allow: false,
        reason:
          'This exact command already ran on this exact tree. Read its result, change something, or ask the user. (A deliberate re-run: prefix KVIRN_GATE_RERUN=1.)',
      }
    }
  }
  return { allow: true }
}

function fingerprint(): string {
  try {
    const diff = execFileSync('git', ['diff', 'HEAD'], { encoding: 'utf8', maxBuffer: 1 << 28 })
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      encoding: 'utf8',
    })
    return createHash('sha1').update(diff).update(untracked).digest('hex')
  } catch {
    return 'no-git'
  }
}

function main(): void {
  let command = ''
  try {
    command = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command ?? ''
  } catch {
    return
  }
  const statePath = join(tmpdir(), 'kvirn-gate-guard.json')
  const recent: { key: string; at: number }[] = existsSync(statePath)
    ? JSON.parse(readFileSync(statePath, 'utf8'))
    : []
  const fresh = recent.filter((entry) => Date.now() - entry.at < 6 * 60 * 60 * 1000)
  const print = fingerprint()
  const verdict = evaluate(command, {
    fingerprint: print,
    seen: new Set(fresh.map((entry) => entry.key)),
  })
  if (!verdict.allow) {
    console.error(`gate-guard: ${verdict.reason}`)
    process.exit(2)
  }
  const key = createHash('sha1').update(command.trim()).update(print).digest('hex')
  writeFileSync(statePath, JSON.stringify([...fresh, { key, at: Date.now() }]))
}

if (process.argv[1] === new URL(import.meta.url).pathname) main()
