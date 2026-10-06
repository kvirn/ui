'use client'
import { Button, Icon, useAnnouncer } from '@kvirn-ui/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { highlight, splitLines } from '../lib/highlight.ts'
import type { CodeLanguage, Token } from '../lib/highlight.ts'
import { messages } from '../messages/en.ts'

const text = messages.docs.code
const copiedMilliseconds = 4000

type CopyStatus = 'idle' | 'copied' | 'failed'

export function useCodeLines(code: string, language: CodeLanguage = 'tsx') {
  return useMemo(() => splitLines(highlight(code, language)), [code, language])
}

/**
 * Writes `code` to the clipboard and tells screen reader users how it went. When the browser
 * refuses, `onFailed` runs (the example opens its code) and the code is selected, so Ctrl+C works.
 */
export function useCodeCopy({
  code,
  codeRef,
  onFailed,
}: {
  code: string
  codeRef: RefObject<HTMLElement | null>
  onFailed?: () => void
}) {
  const { announce } = useAnnouncer()
  const [result, setResult] = useState<{ status: CopyStatus; attempt: number }>({
    status: 'idle',
    attempt: 0,
  })

  useEffect(() => {
    if (result.status === 'failed' && codeRef.current !== null) {
      const range = document.createRange()
      range.selectNodeContents(codeRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    if (result.status === 'copied') {
      const timer = window.setTimeout(
        () => setResult((previous) => ({ ...previous, status: 'idle' })),
        copiedMilliseconds,
      )
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [result, codeRef])

  const copy = async () => {
    let status: CopyStatus = 'copied'
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      status = 'failed'
    }
    announce(status === 'copied' ? text.copied : text.copyFailed)
    if (status === 'failed') {
      onFailed?.()
    }
    setResult((previous) => ({ status, attempt: previous.attempt + 1 }))
  }

  return { status: result.status, copy }
}

export function CodeCopyButton({ onCopy }: { onCopy: () => Promise<void> }) {
  return (
    <Button
      className="docs-code-copy"
      onClick={() => {
        void onCopy()
      }}
    >
      {text.copy}
    </Button>
  )
}

/** A plain paragraph: the Announcer does the speaking, this is the sighted confirmation. */
export function CodeStatus({ status }: { status: CopyStatus }) {
  if (status === 'idle') {
    return null
  }
  return (
    <p className="docs-code-status">
      <Icon name={status === 'copied' ? 'check' : 'warning'} />
      {status === 'copied' ? text.copied : text.copyFailed}
    </p>
  )
}

/** A scroll area is only a named, focusable region while it overflows (accessibility skill §8). */
function useIsOverflowing(ref: RefObject<HTMLElement | null>) {
  const [isOverflowing, setIsOverflowing] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null) {
      return undefined
    }
    const observer = new ResizeObserver(() => {
      setIsOverflowing(element.scrollWidth > element.clientWidth)
    })
    observer.observe(element)
    if (element.firstElementChild !== null) {
      observer.observe(element.firstElementChild)
    }
    return () => observer.disconnect()
  }, [ref])
  return isOverflowing
}

function TokenSpans({ tokens }: { tokens: readonly Token[] }) {
  return tokens.map((token, index) =>
    token.role === 'plain' ? (
      token.text
    ) : (
      // eslint-disable-next-line react/no-array-index-key -- tokens have no identity, and never reorder
      <span key={index} className={`docs-code-${token.role}`}>
        {token.text}
      </span>
    ),
  )
}

export function CodeScroll({
  lines,
  lineNumbers = false,
  labelledBy,
  codeRef,
}: {
  lines: readonly (readonly Token[])[]
  lineNumbers?: boolean | undefined
  labelledBy?: string | undefined
  codeRef: RefObject<HTMLElement | null>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isOverflowing = useIsOverflowing(scrollRef)
  const region = isOverflowing
    ? {
        role: 'region',
        tabIndex: 0,
        ...(labelledBy === undefined
          ? { 'aria-label': text.label }
          : { 'aria-labelledby': labelledBy }),
      }
    : {}
  return (
    <div className="docs-code-scroll" dir="ltr" ref={scrollRef} {...region}>
      <pre dir="ltr" className={lineNumbers ? 'docs-code--line-numbers' : undefined}>
        <code ref={codeRef}>
          {lines.map((line, index) => (
            // eslint-disable-next-line react/no-array-index-key -- lines have no identity, and never reorder
            <span key={index} className="docs-code-line">
              {lineNumbers && (
                <span className="docs-code-number" aria-hidden="true">
                  {index + 1}
                </span>
              )}
              <span className="docs-code-text">
                <TokenSpans tokens={line} />
                {index < lines.length - 1 ? '\n' : ''}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

/**
 * A first line like `// app/providers.tsx` names the file the sample belongs in. It is shown in the
 * header beside Copy code, not in the code, so a copy holds only the code. An explicit `fileName`
 * wins.
 */
const fileNameComment = /^\/\/ ([\w@./[\]-]+\.\w+)\r?\n/

function splitFileName(source: string, given: string | undefined) {
  if (given !== undefined) {
    return { fileName: given, code: source }
  }
  const match = fileNameComment.exec(source)
  return match === null
    ? { fileName: undefined, code: source }
    : { fileName: match[1], code: source.slice(match[0].length) }
}

/**
 * Highlighted code with a copy button. The header holds the optional file name and language, and
 * Copy code. Long lines scroll from 40rem and wrap below (docs/design/docs-code.md §5, §6).
 */
export function CodeBlock({
  code: source,
  language,
  fileName: givenFileName,
  lineNumbers,
}: {
  code: string
  language?: CodeLanguage
  fileName?: string
  lineNumbers?: boolean
}) {
  const fileNameId = useId()
  const codeRef = useRef<HTMLElement>(null)
  const { fileName, code } = splitFileName(source, givenFileName)
  const lines = useCodeLines(code, language)
  const { status, copy } = useCodeCopy({ code, codeRef })
  if (code === '') {
    return <p className="docs-code docs-code-empty">{text.empty}</p>
  }
  return (
    <div className="docs-code">
      <div className="docs-code-header">
        {fileName !== undefined && (
          <span id={fileNameId} className="docs-code-file">
            {fileName}
          </span>
        )}
        {language !== undefined && (
          <span className="docs-code-language">{text.languages[language]}</span>
        )}
        <CodeCopyButton onCopy={copy} />
        <CodeStatus status={status} />
      </div>
      <CodeScroll
        lines={lines}
        lineNumbers={lineNumbers}
        labelledBy={fileName === undefined ? undefined : fileNameId}
        codeRef={codeRef}
      />
    </div>
  )
}
