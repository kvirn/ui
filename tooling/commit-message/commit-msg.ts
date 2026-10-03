// Checks commit messages against Conventional Commits (AGENTS.md, Conventions: commits).
//   node tooling/commit-message/commit-msg.ts <message-file>       git commit-msg hook
//   node tooling/commit-message/commit-msg.ts --range <from>..<to> every commit in a range (CI)
//   node tooling/commit-message/commit-msg.ts --message <text>     one message, such as a PR title
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { checkCommitMessage, commitTypes } from './check-commit-message.ts'

interface CheckedMessage {
  label: string
  problems: string[]
}

const recordSeparator = '\u001E'
const fieldSeparator = '\u0000'

function readCommitsInRange(range: string): CheckedMessage[] {
  const log = execFileSync(
    'git',
    // git expands %x00 and %x1e itself: process arguments can't contain NUL.
    ['log', '--no-merges', '--format=%h%x00%B%x1e', range],
    { encoding: 'utf8' },
  )
  return log
    .split(recordSeparator)
    .map((record) => record.replace(/^\n/, ''))
    .filter((record) => record.trim() !== '')
    .map((record) => {
      const [shortHash = '', message = ''] = record.split(fieldSeparator)
      return {
        label: `${shortHash} ${message.split('\n')[0] ?? ''}`,
        problems: checkCommitMessage(message),
      }
    })
}

function checkArguments(commandArguments: string[]): CheckedMessage[] {
  const [firstArgument, secondArgument] = commandArguments
  if (firstArgument === '--range' && secondArgument !== undefined) {
    return readCommitsInRange(secondArgument)
  }
  if (firstArgument === '--message' && secondArgument !== undefined) {
    return [{ label: secondArgument, problems: checkCommitMessage(secondArgument) }]
  }
  if (firstArgument !== undefined && !firstArgument.startsWith('--')) {
    const message = readFileSync(firstArgument, 'utf8')
    return [{ label: message.split('\n')[0] ?? '', problems: checkCommitMessage(message) }]
  }
  console.error('Usage: commit-msg.ts <message-file> | --range <from>..<to> | --message <text>')
  process.exit(2)
}

const failures = checkArguments(process.argv.slice(2)).filter(
  (checked) => checked.problems.length > 0,
)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`✖ ${failure.label}`)
    for (const problem of failure.problems) console.error(`    ${problem}`)
  }
  console.error(
    [
      '',
      'Commit messages follow Conventional Commits 1.0.0 (AGENTS.md, Conventions: commits):',
      '  <type>[optional scope][!]: <description>',
      '',
      '  [optional body]',
      '',
      '  [optional footer(s), such as BREAKING CHANGE: <description>]',
      '',
      `Types: ${commitTypes.join(', ')}.`,
      'Example: fix(react): keep focus on the trigger after closing',
    ].join('\n'),
  )
  process.exit(1)
}
