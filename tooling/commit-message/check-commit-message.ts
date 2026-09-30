/** Conventional Commits 1.0.0 (https://www.conventionalcommits.org/en/v1.0.0/), ADR-0012. */

export const commitTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const

export const maximumHeaderLength = 100

const scissorsLine = '# ------------------------ >8 ------------------------'
const gitGeneratedHeader = /^(?:Merge |Revert "|fixup! |squash! |amend! )/
const headerPattern = /^(?<type>\w+)(?:\((?<scope>[^()]*)\))?!?:(?: (?<description>.*))?$/
const scopePattern = /^[a-z\d]+(?:[-/][a-z\d]+)*$/
const breakingChangeFooter = /^BREAKING[ -]CHANGE: /
const looseBreakingChangeFooter = /^breaking[ -]change:/i

/** Removes what git strips before committing: comment lines and everything below the scissors line. */
function stripGitComments(message: string): string[] {
  const lines = message.split('\n')
  const scissorsIndex = lines.indexOf(scissorsLine)
  const keptLines = scissorsIndex === -1 ? lines : lines.slice(0, scissorsIndex)
  const contentLines = keptLines
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trimEnd())
  while (contentLines[0] === '') contentLines.shift()
  while (contentLines.at(-1) === '') contentLines.pop()
  return contentLines
}

/** Returns one message per problem. An empty array means the commit message is valid. */
export function checkCommitMessage(message: string): string[] {
  const lines = stripGitComments(message)
  const header = lines[0]
  if (header === undefined) return ['The commit message is empty.']
  if (gitGeneratedHeader.test(header)) return []

  const match = headerPattern.exec(header)
  if (match?.groups === undefined) {
    return [
      'The header must look like "<type>[optional scope][!]: <description>", for example "feat(react): add Button".',
    ]
  }

  const problems: string[] = []
  const { type = '', scope, description = '' } = match.groups
  if (!(commitTypes as readonly string[]).includes(type)) {
    problems.push(`Unknown type "${type}". Use one of: ${commitTypes.join(', ')}.`)
  }
  if (scope !== undefined && !scopePattern.test(scope)) {
    problems.push(
      'The scope must be lower-case letters, digits, "-" or "/", for example "react" or "core/store".',
    )
  }
  if (description.trim() === '') {
    problems.push('The description must not be empty.')
  } else if (description.endsWith('.')) {
    problems.push('Do not end the description with a period.')
  }
  if (header.length > maximumHeaderLength) {
    problems.push(
      `The header is ${header.length} characters long. Keep it to ${maximumHeaderLength} or fewer.`,
    )
  }
  if (lines.length > 1 && lines[1] !== '') {
    problems.push('Leave a blank line between the header and the body.')
  }
  if (
    lines.some((line) => looseBreakingChangeFooter.test(line) && !breakingChangeFooter.test(line))
  ) {
    problems.push('Write the breaking-change footer as "BREAKING CHANGE: <description>".')
  }
  return problems
}
