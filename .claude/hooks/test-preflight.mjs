#!/usr/bin/env node
// Is it safe to start a test run?
//
// BUSY when another heavy run (vitest, vp test/check, e2e, playwright, tsc) is going on anywhere on
// the machine, because two runs at once starve the browser projects and make timing-based tests
// flaky. BUSY when files in this worktree changed within the quiet window, because someone (a
// subagent, the orchestrator, another session) is still editing. Another Claude session in the same
// worktree widens the quiet window.
//
// Usage:
//   node .claude/hooks/test-preflight.mjs                    one check; exit 0 CLEAR, 1 BUSY
//   node .claude/hooks/test-preflight.mjs --wait 120         re-check every 5s for up to 120s
//   node .claude/hooks/test-preflight.mjs --changed-since <stamp>
//                                                            list files changed since <stamp> (from a
//                                                            previous run's `stamp=` line); exit 1 if any
//
// KVIRN_TEST_QUIET_SECONDS sets the quiet window (default 20, or 90 with another session here).
// The guard (`guard-test-runner.mjs`) imports `preflight()` and blocks the test-runner while BUSY.
import { execFileSync } from 'node:child_process'
import { readlinkSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HEAVY_RUN =
  /(^|[\s/])(vitest(\.m?js)?|vp\s+(test|check|lint)|vp\s+run\s+e2e|pnpm\s+(run\s+)?e2e|playwright\s+test|playwright[^\s]*\/cli\.js\s+test|tsc)(\s|$)/
const CLAUDE_SESSION = /(^|[\s/])claude(\s|$)/

const quietDefault = Number(process.env['KVIRN_TEST_QUIET_SECONDS'] ?? 20)
const quietWithOtherSession = Math.max(quietDefault, 90)

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return ''
  }
}

function processes() {
  return run('ps', ['-eo', 'pid=,ppid=,args='])
    .split('\n')
    .map((line) => line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map(([, pid, ppid, args]) => ({ pid: Number(pid), ppid: Number(ppid), args }))
}

function ancestorsOf(pid, table) {
  const byPid = new Map(table.map((entry) => [entry.pid, entry]))
  const ancestors = new Set([pid])
  let current = byPid.get(pid)
  while (current !== undefined && !ancestors.has(current.ppid)) {
    ancestors.add(current.ppid)
    current = byPid.get(current.ppid)
  }
  return ancestors
}

function cwdOf(pid) {
  try {
    return readlinkSync(`/proc/${pid}/cwd`)
  } catch {
    return undefined
  }
}

function isInside(directory, root) {
  return directory === root || directory.startsWith(root + path.sep)
}

function changedFiles(root) {
  return run('git', ['ls-files', '-z', '-m', '-o', '--exclude-standard'], root)
    .split('\0')
    .filter((file) => file !== '')
    .flatMap((file) => {
      try {
        return [{ file, modified: statSync(path.join(root, file)).mtimeMs }]
      } catch {
        return []
      }
    })
}

/** One check. `cwd` is any directory inside the worktree to be tested. */
export function preflight(cwd = process.cwd()) {
  const root = run('git', ['rev-parse', '--show-toplevel'], cwd).trim() || cwd
  const table = processes()
  const self = ancestorsOf(process.pid, table)
  const others = table.filter((entry) => !self.has(entry.pid))

  const runs = others
    .filter((entry) => HEAVY_RUN.test(entry.args))
    // A child of a run we already list is the same run.
    .filter((entry, _, list) => !list.some((parent) => parent.pid === entry.ppid))
  const sessions = others.filter((entry) => {
    if (!CLAUDE_SESSION.test(entry.args)) return false
    const directory = cwdOf(entry.pid)
    return directory !== undefined && isInside(directory, root)
  })

  const quietSeconds = sessions.length > 0 ? quietWithOtherSession : quietDefault
  const since = Date.now() - quietSeconds * 1000
  const edits = changedFiles(root).filter((entry) => entry.modified > since)

  const reasons = [
    ...runs.map(
      (entry) =>
        `test run in progress: pid ${entry.pid} (${cwdOf(entry.pid) ?? '?'}): ${entry.args.slice(0, 160)}`,
    ),
    ...(edits.length > 0
      ? [
          `files edited in the last ${quietSeconds}s: ${edits.map((entry) => entry.file).join(', ')}`,
        ]
      : []),
  ]
  const notes = sessions.map(
    (entry) => `another Claude session works in this worktree: pid ${entry.pid}`,
  )
  return { busy: reasons.length > 0, reasons, notes, root, stamp: Math.floor(Date.now() / 1000) }
}

function report(result) {
  const lines = [`preflight: ${result.busy ? 'BUSY' : 'CLEAR'}`, `stamp=${result.stamp}`]
  for (const reason of result.reasons) lines.push(`- ${reason}`)
  for (const note of result.notes) lines.push(`note: ${note}`)
  return lines.join('\n')
}

async function main(argv) {
  const sinceIndex = argv.indexOf('--changed-since')
  if (sinceIndex !== -1) {
    const stamp = Number(argv[sinceIndex + 1])
    if (!Number.isFinite(stamp)) {
      console.error('--changed-since needs the stamp= value from an earlier preflight')
      return 2
    }
    const root = run('git', ['rev-parse', '--show-toplevel'], process.cwd()).trim() || process.cwd()
    const changed = changedFiles(root).filter((entry) => entry.modified > stamp * 1000)
    if (changed.length === 0) {
      console.log('changed-since: none')
      return 0
    }
    console.log(`changed-since: ${changed.length} file(s) changed during the run`)
    for (const entry of changed) console.log(`- ${entry.file}`)
    return 1
  }

  const waitIndex = argv.indexOf('--wait')
  const waitSeconds = waitIndex === -1 ? 0 : Number(argv[waitIndex + 1] ?? 0)
  const deadline = Date.now() + waitSeconds * 1000
  let result = preflight()
  while (result.busy && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    result = preflight()
  }
  console.log(report(result))
  return result.busy ? 1 : 0
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = await main(process.argv.slice(2))
}
