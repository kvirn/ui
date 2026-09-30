import { describe, expect, it } from 'vite-plus/test'
import { checkCommitMessage } from './check-commit-message.ts'

describe('checkCommitMessage', () => {
  it.each([
    'feat: add user authentication',
    'fix(app): prevent duplicate submissions',
    'chore: update dependencies',
    'docs: improve installation guide',
    'refactor(api): simplify request handling',
    'test: add authentication tests',
    'perf: reduce database queries',
    'ci: update GitHub Actions workflow',
    'build: update Vite configuration',
    'style: format code',
    'revert: undo theme token rename',
    'feat!: redesign authentication API',
    'feat(react)!: rename triggerProps',
    'fix(core/store): keep selection on reset',
  ])('accepts "%s"', (message) => {
    expect(checkCommitMessage(message)).toEqual([])
  })

  it('accepts a body and footers, including a breaking change and a co-author', () => {
    const message = [
      'feat(api): redesign authentication API',
      '',
      'Tokens are now scoped per service.',
      '',
      'BREAKING CHANGE: authentication tokens now require a scope',
      'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>',
    ].join('\n')
    expect(checkCommitMessage(message)).toEqual([])
  })

  it('ignores comment lines and everything below the scissors line, as git does', () => {
    const message = [
      'fix(i18n): add missing Sámi string',
      '# Please enter the commit message for your changes.',
      '# ------------------------ >8 ------------------------',
      'diff --git a/file b/file',
    ].join('\n')
    expect(checkCommitMessage(message)).toEqual([])
  })

  it.each([
    'Merge branch "main" into feat/button',
    'Revert "feat: add Button"',
    'fixup! feat: add Button',
    'squash! feat: add Button',
    'amend! feat: add Button',
  ])('lets git-generated message "%s" through', (message) => {
    expect(checkCommitMessage(message)).toEqual([])
  })

  it('rejects an empty message', () => {
    expect(checkCommitMessage('\n# only a comment\n')).toEqual(['The commit message is empty.'])
  })

  it('rejects a header without a type', () => {
    expect(checkCommitMessage('initial commit')).toEqual([
      'The header must look like "<type>[optional scope][!]: <description>", for example "feat(react): add Button".',
    ])
  })

  it('rejects an unknown type', () => {
    expect(checkCommitMessage('feature: add Button')).toEqual([
      'Unknown type "feature". Use one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.',
    ])
  })

  it('rejects an upper-case type', () => {
    expect(checkCommitMessage('Fix: prevent duplicate submissions')).toEqual([
      'Unknown type "Fix". Use one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.',
    ])
  })

  it.each(['feat(): add Button', 'feat(React): add Button', 'feat(react button): add Button'])(
    'rejects the scope in "%s"',
    (message) => {
      expect(checkCommitMessage(message)).toEqual([
        'The scope must be lower-case letters, digits, "-" or "/", for example "react" or "core/store".',
      ])
    },
  )

  it('rejects a missing space after the colon', () => {
    expect(checkCommitMessage('feat:add Button')).toEqual([
      'The header must look like "<type>[optional scope][!]: <description>", for example "feat(react): add Button".',
    ])
  })

  it('rejects an empty description', () => {
    expect(checkCommitMessage('feat(react): ')).toEqual(['The description must not be empty.'])
  })

  it('rejects a description ending with a period', () => {
    expect(checkCommitMessage('docs: improve installation guide.')).toEqual([
      'Do not end the description with a period.',
    ])
  })

  it('rejects a header longer than 100 characters', () => {
    const header = `feat: ${'a'.repeat(95)}`
    expect(checkCommitMessage(header)).toEqual([
      'The header is 101 characters long. Keep it to 100 or fewer.',
    ])
  })

  it('rejects a body that is not separated from the header by a blank line', () => {
    expect(checkCommitMessage('feat: add Button\nMore detail')).toEqual([
      'Leave a blank line between the header and the body.',
    ])
  })

  it('rejects a breaking-change footer that is not upper case', () => {
    expect(checkCommitMessage('feat: add Button\n\nBreaking change: renamed props')).toEqual([
      'Write the breaking-change footer as "BREAKING CHANGE: <description>".',
    ])
  })
})
