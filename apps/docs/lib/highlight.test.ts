import { describe, expect, test } from 'vite-plus/test'
import { highlight, splitLines } from './highlight.ts'
import type { Token, TokenRole } from './highlight.ts'

const textOf = (tokens: readonly Token[]) => tokens.map((token) => token.text).join('')
const rolesOf = (tokens: readonly Token[], role: TokenRole) =>
  tokens.filter((token) => token.role === role).map((token) => token.text)

describe('highlight', () => {
  test('tsx: reserved words are keywords, quotes are strings, numbers and booleans are literals', () => {
    const tokens = highlight("import { Button } from '@kvirn-ui/react'\nconst size = 4 + 1", 'tsx')
    expect(rolesOf(tokens, 'keyword')).toEqual(['import', 'from', 'const'])
    expect(rolesOf(tokens, 'string')).toEqual(["'@kvirn-ui/react'"])
    expect(rolesOf(tokens, 'literal')).toEqual(['4', '1'])
    expect(rolesOf(highlight('const on = true', 'tsx'), 'literal')).toEqual(['true'])
  })

  test('tsx: comments run to the end of the line and across lines for block comments', () => {
    const tokens = highlight('// note\nconst a = 1 /* two\nlines */', 'tsx')
    expect(rolesOf(tokens, 'comment')).toEqual(['// note', '/* two\nlines */'])
  })

  test('tsx: JSX tag names are keywords, attribute names and a prop called type are not', () => {
    const tokens = highlight('<Button type="button">Save</Button>', 'tsx')
    expect(rolesOf(tokens, 'keyword')).toEqual(['Button', 'Button'])
    expect(rolesOf(tokens, 'string')).toEqual(['"button"'])
  })

  test('tsx: words that only contain a reserved word stay plain', () => {
    expect(rolesOf(highlight('constant.type = format1', 'ts'), 'keyword')).toEqual([])
  })

  test('tsx: a template literal is one string', () => {
    expect(rolesOf(highlight('const a = `x ${y} z`', 'tsx'), 'string')).toEqual(['`x ${y} z`'])
  })

  test('json: keys are plain, string values are strings, numbers and null are literals', () => {
    const tokens = highlight('{ "name": "kvirn", "size": 4, "next": null }', 'json')
    expect(rolesOf(tokens, 'string')).toEqual(['"kvirn"'])
    expect(rolesOf(tokens, 'literal')).toEqual(['4', 'null'])
  })

  test('css: at-rules and !important are keywords, strings and url() are strings, numbers and hex are literals', () => {
    const tokens = highlight(
      '@layer kv { a { color: #fff; margin: 4px; background: url(x.png); content: "x" !important } }',
      'css',
    )
    expect(rolesOf(tokens, 'keyword')).toEqual(['@layer', '!important'])
    expect(rolesOf(tokens, 'string')).toEqual(['url(x.png)', '"x"'])
    expect(rolesOf(tokens, 'literal')).toEqual(['#fff', '4px'])
  })

  test('css: custom property names with digits are plain', () => {
    expect(rolesOf(highlight('a { color: var(--kv-space-4) }', 'css'), 'literal')).toEqual([])
  })

  test('bash: the first word of a line is the command, flags are literals, # starts a comment', () => {
    const tokens = highlight(
      'pnpm add -D @kvirn-ui/react --save # install\n  npm run "x y"',
      'bash',
    )
    expect(rolesOf(tokens, 'keyword')).toEqual(['pnpm', 'npm'])
    expect(rolesOf(tokens, 'literal')).toEqual(['-D', '--save'])
    expect(rolesOf(tokens, 'comment')).toEqual(['# install'])
    expect(rolesOf(tokens, 'string')).toEqual(['"x y"'])
  })

  test('html: tag names are keywords, attribute values are strings, comments are comments', () => {
    const tokens = highlight("<!-- hi --><div class=\"a\" id='b'>it's</div>", 'html')
    expect(rolesOf(tokens, 'keyword')).toEqual(['div', 'div'])
    expect(rolesOf(tokens, 'string')).toEqual(['"a"', "'b'"])
    expect(rolesOf(tokens, 'comment')).toEqual(['<!-- hi -->'])
  })

  test('the tokens always join back to the input, for every language', () => {
    const samples = [
      "const a = 'x",
      '/* open',
      '"',
      '`open ${',
      '<',
      '</',
      '@',
      '#',
      'url(',
      '\u{1F600}',
    ]
    for (const language of ['tsx', 'ts', 'json', 'css', 'bash', 'html']) {
      for (const sample of samples) {
        expect(textOf(highlight(sample, language))).toBe(sample)
      }
    }
  })

  test('an unknown language is plain text and never throws', () => {
    expect(highlight('const a = 1', 'cobol')).toEqual([{ role: 'plain', text: 'const a = 1' }])
    expect(highlight('x', 'constructor')).toEqual([{ role: 'plain', text: 'x' }])
  })

  test('empty input has no tokens', () => {
    expect(highlight('', 'tsx')).toEqual([])
  })
})

describe('splitLines', () => {
  test('a token that spans lines is split, and a final newline adds no empty line', () => {
    const lines = splitLines(highlight('/* a\nb */\nconst x\n', 'tsx'))
    expect(lines.map((line) => textOf(line))).toEqual(['/* a', 'b */', 'const x'])
    expect(lines[0]).toEqual([{ role: 'comment', text: '/* a' }])
  })

  test('an empty line in the middle stays', () => {
    expect(splitLines(highlight('a\n\nb', 'ts')).map((line) => textOf(line))).toEqual([
      'a',
      '',
      'b',
    ])
  })
})
