export type TokenRole = 'plain' | 'keyword' | 'string' | 'literal' | 'comment'
export type Token = { role: TokenRole; text: string }
export type CodeLanguage = 'tsx' | 'ts' | 'json' | 'css' | 'bash' | 'html'

type Rule = readonly [RegExp, TokenRole]

// Sticky, so each rule is tried at the current position only. Multiline for `^` in lookbehinds.
const rule = (source: string, role: TokenRole): Rule => [new RegExp(source, 'ym'), role]

const reservedWords =
  'import|export|from|const|let|var|function|return|type|interface|if|else|for|while|of|in|new|class|extends|default|async|await|as|typeof|void|throw|try|catch|switch|case|break|continue|enum|implements|satisfies'

const script: readonly Rule[] = [
  rule(String.raw`\/\/[^\n]*`, 'comment'),
  rule(String.raw`\/\*[\s\S]*?(?:\*\/|(?![\s\S]))`, 'comment'),
  rule(String.raw`'(?:[^'\\\n]|\\.)*'?`, 'string'),
  rule(String.raw`"(?:[^"\\\n]|\\.)*"?`, 'string'),
  rule(String.raw`\x60(?:[^\x60\\]|\\[\s\S])*\x60?`, 'string'),
  rule(String.raw`(?<![.\w$])(?:${reservedWords})(?![\w$]|=)`, 'keyword'),
  rule(String.raw`(?<![.\w$])(?:true|false|null|undefined)(?![\w$])`, 'literal'),
  rule(String.raw`(?<=(?:(?<![\w$>)\]])<|<\/))[A-Za-z][\w.]*`, 'keyword'),
  rule(String.raw`[A-Za-z_$][\w$]*`, 'plain'),
  rule(String.raw`\d[\d_]*(?:\.\d+)?`, 'literal'),
]

const rules: Record<CodeLanguage, readonly Rule[]> = {
  tsx: script,
  ts: script,
  json: [
    rule(String.raw`"(?:[^"\\\n]|\\.)*"(?=\s*:)`, 'plain'),
    rule(String.raw`"(?:[^"\\\n]|\\.)*"?`, 'string'),
    rule(String.raw`(?:true|false|null)(?![\w$])`, 'literal'),
    rule(String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?`, 'literal'),
  ],
  css: [
    rule(String.raw`\/\*[\s\S]*?(?:\*\/|(?![\s\S]))`, 'comment'),
    rule(String.raw`'(?:[^'\\\n]|\\.)*'?`, 'string'),
    rule(String.raw`"(?:[^"\\\n]|\\.)*"?`, 'string'),
    rule(String.raw`url\([^)\n]*\)?`, 'string'),
    rule(String.raw`@[\w-]+`, 'keyword'),
    rule(String.raw`!\s*important`, 'keyword'),
    rule(String.raw`#[0-9a-fA-F]{3,8}(?![\w-])`, 'literal'),
    rule(String.raw`-{0,2}[A-Za-z_][\w-]*`, 'plain'),
    rule(String.raw`-?(?:\d+\.?\d*|\.\d+)(?:[a-zA-Z%]+)?`, 'literal'),
  ],
  bash: [
    rule(String.raw`(?<=^|\s)#[^\n]*`, 'comment'),
    rule(String.raw`'[^']*'?`, 'string'),
    rule(String.raw`"(?:[^"\\]|\\[\s\S])*"?`, 'string'),
    rule(String.raw`(?<=\s)--?[A-Za-z][\w-]*`, 'literal'),
    rule(String.raw`(?<=^[ \t]*)[A-Za-z_./][\w./-]*`, 'keyword'),
    rule(String.raw`[\w./@:=-]+`, 'plain'),
  ],
  html: [
    rule(String.raw`<!--[\s\S]*?(?:-->|(?![\s\S]))`, 'comment'),
    rule(String.raw`(?<=<\/?)[A-Za-z][\w-]*`, 'keyword'),
    rule(String.raw`(?<==\s*)(?:"[^"]*"?|'[^']*'?)`, 'string'),
  ],
}

function scan(code: string, languageRules: readonly Rule[]): Token[] {
  const tokens: Token[] = []
  const push = (role: TokenRole, text: string) => {
    const last = tokens.at(-1)
    if (last?.role === role) {
      last.text += text
    } else {
      tokens.push({ role, text })
    }
  }
  let position = 0
  while (position < code.length) {
    let matched = false
    for (const [pattern, role] of languageRules) {
      pattern.lastIndex = position
      const match = pattern.exec(code)
      if (match !== null && match[0].length > 0) {
        push(role, match[0])
        position += match[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      push('plain', code.charAt(position))
      position += 1
    }
  }
  return tokens
}

/**
 * Splits `code` into role-tagged runs whose text joins back to `code`. Highlighting is
 * decoration: unknown languages and anything the rules choke on come back as plain text.
 */
export function highlight(code: string, language: string): Token[] {
  const languageRules = Object.hasOwn(rules, language) ? rules[language as CodeLanguage] : undefined
  if (languageRules === undefined || code === '') {
    return code === '' ? [] : [{ role: 'plain', text: code }]
  }
  try {
    return scan(code, languageRules)
  } catch {
    return [{ role: 'plain', text: code }]
  }
}

/** One array of tokens per source line, without the empty one after a final newline. A token that spans lines is split at each newline. */
export function splitLines(tokens: readonly Token[]): Token[][] {
  const lines: Token[][] = [[]]
  for (const token of tokens) {
    token.text.split('\n').forEach((part, index) => {
      if (index > 0) {
        lines.push([])
      }
      if (part !== '') {
        lines.at(-1)!.push({ role: token.role, text: part })
      }
    })
  }
  if (lines.length > 1 && lines.at(-1)!.length === 0) {
    lines.pop()
  }
  return lines
}
